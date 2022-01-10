import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { UpdateQuery } from 'mongodb';
import { i18n } from '/imports/startup/both/i18next';
import { _ } from 'meteor/underscore';
import moment from 'moment';

import { Courses } from '/imports/api/courses/courses';
import { Subscribe, processChange } from '/imports/api/courses/subscription';
import * as courseHistoryDenormalizer from '/imports/api/courses/historyDenormalizer';
import * as courseTimeLasteditDenormalizer from '/imports/api/courses/timeLasteditDenormalizer';
import {
	EventEntity,
	EventModel,
	Events,
	EventVenueEntity,
	OEvent,
} from '/imports/api/events/events';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import { VenueModel, Venues } from '/imports/api/venues/venues';

import { Notification } from '/imports/notification/notification';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import { AffectedReplicaSelectors } from '/imports/utils/affected-replica-selectors';
import { AsyncTools } from '/imports/utils/async-tools';
import * as HtmlTools from '/imports/utils/html-tools';
import LocalTime from '/imports/utils/local-time';
import * as StringTools from '/imports/utils/string-tools';
import * as UpdateMethods from '/imports/utils/update-methods';
import { ServerMethod } from '/imports/utils/ServerMethod';

/**
 * @param updateOptions What should be updated
 */
const ReplicaSync = function (
	event: EventEntity,
	updateOptions: { infos?: boolean; time?: boolean; changedReplicas: { time?: boolean } },
) {
	let affected = 0;

	const apply = function (changes: Partial<EventEntity>) {
		const startMoment = moment(changes.start);
		const endMoment = moment(changes.end);
		const timeIsValid = startMoment.isValid() && endMoment.isValid();
		const startTime = { hour: startMoment.hour(), minute: startMoment.minute() };
		const timeDelta = endMoment.diff(startMoment);

		Events.find(AffectedReplicaSelectors(event)).forEach((replica) => {
			const replicaChanges = updateOptions.infos ? { ...changes } : {};

			const updateTime =
				timeIsValid &&
				updateOptions.time &&
				(replica.sameTime(event) || updateOptions.changedReplicas.time);

			if (updateTime) {
				const newStartMoment = moment(replica.start).set(startTime);
				Object.assign(replicaChanges, {
					start: newStartMoment.toDate(),
					end: newStartMoment.add(timeDelta).toDate(),
				});

				const regionZone = LocalTime.zone(replica.region);
				Object.assign(replicaChanges, {
					startLocal: regionZone.toString(replicaChanges.start as Date),
					endLocal: regionZone.toString(replicaChanges.end as Date),
				});
			} else {
				delete replicaChanges.start;
				delete replicaChanges.end;
				delete replicaChanges.startLocal;
				delete replicaChanges.endLocal;
			}

			if (updateOptions.infos || updateTime) {
				// only update if something has changed
				Events.update({ _id: replica._id }, { $set: replicaChanges });
			}

			affected += 1;
		});
	};

	return {
		affected() {
			return affected;
		},
		apply,
	};
};

export interface SaveFields {
	title: string;
	description: string;
	venue?: EventVenueEntity;
	room?: string;
	startLocal?: string;
	endLocal?: string;
	internal?: boolean;
	maxParticipants?: number;
	courseId?: string;
	region?: string;
	replicaOf?: string;
	groups?: string[];
}

export const save = ServerMethod(
	'event.save',

	(args: {
		changes: SaveFields;
		updateReplicasInfos?: boolean;
		updateReplicasTime?: boolean;
		updateChangedReplicasTime?: boolean;
		sendNotifications?: boolean;
		eventId: string;
		comment?: string | null;
	}) => {
		const {
			changes,
			updateReplicasInfos,
			updateReplicasTime,
			updateChangedReplicasTime,
			sendNotifications,
		} = args;

		let { eventId, comment } = args;

		check(eventId, String);

		const expectedFields: Match.Pattern = {
			title: String,
			description: String,
			venue: Match.Optional(Object),
			room: Match.Optional(String),
			startLocal: Match.Optional(String),
			endLocal: Match.Optional(String),
			internal: Match.Optional(Boolean),
			maxParticipants: Match.Optional(Match.Integer),
		};

		const isNew = eventId === '';
		if (isNew) {
			expectedFields.courseId = Match.Optional(String);
			expectedFields.region = String;
			expectedFields.replicaOf = Match.Optional(String);
			expectedFields.groups = Match.Optional([String]);
		}

		check(changes, expectedFields);
		check(comment, Match.Maybe(String));

		const editFields = changes as Partial<EventEntity>;

		const user = Meteor.user();
		if (!user) {
			if (Meteor.isClient) {
				PleaseLogin();
				return undefined;
			}
			throw new Meteor.Error(401, 'please log in');
		}

		const now = new Date();

		editFields.time_lastedit = now;

		let event: EventModel;
		if (isNew) {
			editFields.time_created = now;
			if (editFields.courseId) {
				const course = Courses.findOne(editFields.courseId);
				if (!course) {
					throw new Meteor.Error(404, 'course not found');
				}
				if (!course.editableBy(user)) {
					throw new Meteor.Error(401, 'not permitted');
				}
			}

			if (editFields.replicaOf) {
				const parent = Events.findOne(editFields.replicaOf);
				if (!parent) {
					throw new Meteor.Error(404, 'replica parent not found');
				}
				if (parent.courseId !== editFields.courseId) {
					throw new Meteor.Error(400, 'replica must be in same course');
				}
			}

			if (!editFields.startLocal) {
				throw new Meteor.Error(400, 'Event date not provided');
			}

			const testedGroups =
				editFields.groups?.map((groupId) => {
					const group = Groups.findOne(groupId);
					if (!group) {
						throw new Meteor.Error(404, `no group with id ${groupId}`);
					}
					return group._id;
				}) || [];
			editFields.groups = testedGroups;

			// Coerce faulty end dates
			if (!editFields.endLocal || editFields.endLocal < editFields.startLocal) {
				editFields.endLocal = editFields.startLocal;
			}

			editFields.internal = !!editFields.internal;

			// Synthesize event document because the code below relies on it
			event = _.extend(new OEvent(), {
				region: editFields.region,
				courseId: editFields.courseId,
				editors: [user._id],
			});
		} else {
			const result = Events.findOne(eventId);
			if (!result) {
				throw new Meteor.Error(404, 'No such event');
			}
			event = result;
		}

		if (!event.editableBy(user)) {
			throw new Meteor.Error(401, 'not permitted');
		}

		const region = Regions.findOne(event.region);

		if (!region) {
			throw new Meteor.Error(400, 'Region not found');
		}

		const regionZone = LocalTime.zone(region._id);

		// Don't allow moving past events or moving events into the past
		// This section needs a rewrite even more than the rest of this method
		if (editFields.startLocal) {
			const startMoment = regionZone.fromString(editFields.startLocal);
			if (!startMoment.isValid()) {
				throw new Meteor.Error(400, 'Invalid start date');
			}

			if (startMoment.isBefore(new Date())) {
				if (isNew) {
					throw new Meteor.Error(400, 'Event start in the past');
				}

				// No changing the date of past events
				delete editFields.startLocal;
				delete editFields.endLocal;
			} else {
				editFields.startLocal = regionZone.toString(startMoment); // Round-trip for security
				editFields.start = startMoment.toDate();

				let endMoment;
				if (editFields.endLocal) {
					endMoment = regionZone.fromString(editFields.endLocal);
					if (!endMoment.isValid()) {
						throw new Meteor.Error(400, 'Invalid end date');
					}
				} else {
					endMoment = regionZone.fromString(event.endLocal);
				}

				if (endMoment.isBefore(startMoment)) {
					endMoment = startMoment; // Enforce invariant
				}
				editFields.endLocal = regionZone.toString(endMoment);
				editFields.end = endMoment.toDate();
			}
		}

		// prevent to choose a value which is lower than actual registered participants
		if (editFields.maxParticipants) {
			// if maxParticipants is 0 or no participants registered yet,
			// we dont need this check, 0 means no participant limit.
			if (event.participants && event.maxParticipants) {
				const numParticipantsRegistered = event.participants.length;
				if (numParticipantsRegistered > editFields.maxParticipants) {
					throw new Meteor.Error(
						400,
						`the minimal possible value is ${numParticipantsRegistered}, ` +
							`because ${numParticipantsRegistered} users have already registered.`,
					);
				}
			}
		}

		if (Meteor.isServer) {
			const sanitizedDescription = StringTools.saneText(editFields.description as string);
			editFields.description = HtmlTools.saneHtml(sanitizedDescription);
		}

		if (editFields.title) {
			editFields.title = StringTools.saneTitle(editFields.title).substring(0, 1000);
			editFields.slug = StringTools.slug(editFields.title);
		}

		let affectedReplicaCount = 0;
		if (isNew) {
			editFields.createdBy = user._id;
			editFields.groupOrganizers = [];
			eventId = Events.insert(editFields as EventModel);

			if (editFields.courseId) {
				courseTimeLasteditDenormalizer.afterEventInsert(editFields.courseId);
				courseHistoryDenormalizer.afterEventInsert(editFields.courseId, user._id, {
					_id: eventId,
					title: editFields.title as string,
					slug: editFields.slug as string,
					startLocal: editFields.startLocal as string,
				});
			}
		} else {
			Events.update(eventId, { $set: editFields });

			if (updateReplicasInfos || updateReplicasTime) {
				const updateOptions = {
					infos: updateReplicasInfos,
					time: updateReplicasTime,
					changedReplicas: { time: updateChangedReplicasTime },
				};
				const replicaSync = ReplicaSync(event, updateOptions);
				replicaSync.apply(editFields);
				affectedReplicaCount = replicaSync.affected();
			}

			if (event.courseId) {
				courseHistoryDenormalizer.afterEventUpdate(event.courseId, user._id, {
					_id: eventId,
					title: editFields.title as string,
					slug: editFields.slug as string,
					startLocal: editFields.startLocal as string,
					replicasUpdated: !!(updateReplicasInfos || updateReplicasTime),
				});
			}
		}

		if (sendNotifications) {
			if (affectedReplicaCount) {
				const affectedReplicaMessage = i18n(
					'notification.event.affectedReplicaMessage',
					'These changes have also been applied to {NUM, plural, one{the later copy} other{# later copies} }',
					{ NUM: affectedReplicaCount },
				);

				if (comment == null) {
					comment = affectedReplicaMessage;
				} else {
					comment = `${affectedReplicaMessage}\n\n${comment}`;
				}
			}

			if (comment != null) {
				comment = comment.trim().substr(0, 2000).trim();
			}

			Notification.Event.record(eventId, isNew, comment || undefined);
		}

		if (Meteor.isServer) {
			Meteor.call('event.updateVenue', eventId, AsyncTools.logErrors);
			Meteor.call('event.updateGroups', eventId, AsyncTools.logErrors);
			Meteor.call('region.updateCounters', event.region, AsyncTools.logErrors);

			// the assumption is that all replicas have the same course if any
			if (event.courseId) {
				Meteor.call('course.updateNextEvent', event.courseId, AsyncTools.logErrors);
			}
		}

		return eventId;
	},
);

export const remove = ServerMethod('event.remove', (eventId: string) => {
	check(eventId, String);

	const user = Meteor.user();
	if (!user) {
		throw new Meteor.Error(401, 'please log in');
	}

	const event = Events.findOne(eventId);
	if (!event) {
		throw new Meteor.Error(404, 'No such event');
	}

	if (!event.editableBy(user)) {
		throw new Meteor.Error(401, 'not permitted');
	}

	Events.remove(eventId);

	if (event.courseId) {
		courseHistoryDenormalizer.afterEventRemove(event.courseId, user._id, {
			title: event.title,
			startLocal: event.startLocal,
		});

		Meteor.call('course.updateNextEvent', event.courseId);
	}
	Meteor.call('region.updateCounters', event.region, AsyncTools.logErrors);
});

/**
 * Add or remove a group from the groups list
 *
 * @param eventId The event to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const promote = ServerMethod('event.promote', UpdateMethods.promote(Events));

/**
 * Add or remove a group from the groupOrganizers list
 *
 * @param eventId The event to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const editing = ServerMethod('event.editing', UpdateMethods.editing(Events));

/**
 * Add current user as event-participant
 *
 * the user is also signed up for the course.
 */
export const addParticipant = ServerMethod(
	'event.addParticipant',
	/**
	 * @param eventId The event to register for
	 */
	(eventId: string) => {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, 'please log in');
		}

		const event = Events.findOne(eventId);
		// ignore broken eventIds
		if (!event) {
			return;
		}

		// dont allow participant-mutations if event has passed
		if (moment().isAfter(event.end)) {
			throw new Meteor.Error(401, 'cannot register, event has already passed');
		}

		Events.update({ _id: eventId }, { $addToSet: { participants: user._id } });
		// if you cant load course its probably because the event doesnt have one
		const course = Courses.findOne(event.courseId);
		if (!course) {
			return;
		}

		const change = new Subscribe(course, user, 'participant');

		if (change.validFor(user)) {
			processChange(change);
		}
	},
);

export const removeParticipant = ServerMethod('event.removeParticipant', (eventId: string) => {
	const userId = Meteor.userId();
	if (!userId) {
		throw new Meteor.Error(401, 'please log in');
	}

	const event = Events.findOne(eventId);
	// ignore broken eventIds
	if (!event) {
		return;
	}
	// dont allow participant-mutations if event has passed
	if (moment().isAfter(event.end)) {
		throw new Meteor.Error(401, 'cannot unregister, event has already passed');
	}

	Events.update({ _id: eventId }, { $pull: { participants: userId } });
});

Meteor.methods({
	/**
	 * Update the venue field for all events matching the selector
	 */
	'event.updateVenue'(selector) {
		const idOnly = { fields: { _id: 1 } };
		Events.find(selector, idOnly).forEach((originalEvent) => {
			const eventId = originalEvent._id;

			AsyncTools.untilClean((resolve, reject) => {
				const event = Events.findOne(eventId);

				if (!event) {
					// Nothing was successfully updated, we're done.
					resolve(true);
					return;
				}

				if (!_.isObject(event.venue)) {
					// This happens only at creation when the field was not initialized correctly
					Events.update(event._id, { $set: { venue: {} } });
					resolve(false);
					return;
				}

				let venue: VenueModel | undefined | false = false;
				if (event.venue._id) {
					venue = Venues.findOne(event.venue._id);
				}

				let update: UpdateQuery<EventEntity> | Partial<EventEntity>;
				if (venue) {
					if (event.start < new Date()) {
						// Do not update venue for historical events
						resolve(true);
						return;
					}

					// Sync values to the values set in the venue document
					update = {
						$set: {
							'venue.name': venue.name,
							'venue.address': venue.address,
							'venue.loc': venue.loc,
							'venue.editor': venue.editor,
						},
					};
				} else {
					// If the venue vanished from the DB we delete the reference but let the cached fields
					// live on
					update = { $unset: { 'venue._id': 1 } };
				}

				Events.rawCollection().update({ _id: event._id }, update, (err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result.result.nModified === 0);
					}
				});
			}).catch((reason) => {
				/* eslint-disable-next-line no-console */
				console.log('Failed event.updateVenue: ', reason);
			});
		});
	},

	/**
	 * Update the group-related fields of events matching the selector
	 */
	'event.updateGroups'(selector) {
		const idOnly = { fields: { _id: 1 } };
		Events.find(selector, idOnly).forEach((event) => {
			Events.updateGroups(event._id);
		});
	},
});
