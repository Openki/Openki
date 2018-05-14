import { Meteor } from 'meteor/meteor';

import Courses from '../courses/courses.js';
import Events from './events.js';
import Groups from '../groups/groups.js';
import Regions from '../regions/regions.js';
import Venues from '/imports/api/venues/venues.js';

import AsyncTools from '/imports/utils/async-tools.js';
import HtmlTools from '/imports/utils/html-tools.js';
import LocalTime from '/imports/utils/local-time.js';
import Notification from '/imports/notification/notification.js';
import StringTools from '/imports/utils/string-tools.js';
import AffectedReplicaSelectors from '/imports/utils/affected-replica-selectors.js';
import PleaseLogin from '/imports/ui/lib/please-login.js';
import UpdateMethods from '/imports/utils/update-methods.js';

const ReplicaSync = function(event, updateChangedReplicas) {
	let affected = 0;

	const apply = function(changes) {
		const startMoment = moment(changes.start);
		const startTime = { hour: startMoment.hour(), minute: startMoment.minute() };
		const timeDelta = moment(changes.end).diff(startMoment);

		Events.find(AffectedReplicaSelectors(event)).forEach((replica) => {
			const replicaChanges = Object.assign({}, changes); // Shallow clone

			const updateTime = changes.start
							&& (updateChangedReplicas || replica.sameTime(event));

			if (updateTime) {
				const newStartMoment = moment(replica.start).set(startTime);
				Object.assign(replicaChanges,
					{ start: newStartMoment.toDate()
					, end: newStartMoment.add(timeDelta).toDate()
					}
				);

				const regionZone = LocalTime.zone(replica.region);
				Object.assign(replicaChanges,
					{ startLocal: regionZone.toString(replicaChanges.start)
					, endLocal: regionZone.toString(replicaChanges.end )
					}
				);
			}

			Events.update({ _id: replica._id }, { $set: replicaChanges });

			affected++;
		});
	};

	return (
		{ affected() { return affected; }
		, apply
		}
	);
};

Meteor.methods({
	'event.save': function(args) {
		let
			{ eventId
			, changes
			, updateReplicas
			, updateChangedReplicas
			, sendNotifications
			, comment
			} = args;

		check(eventId, String);

		var expectedFields = {
			title:       String,
			description: String,
			venue:       Match.Optional(Object),
			room:        Match.Optional(String),
			startLocal:  Match.Optional(String),
			endLocal:    Match.Optional(String),
			internal:    Match.Optional(Boolean),
		};

		var isNew = eventId === '';
		if (isNew) {
			expectedFields.courseId  = Match.Optional(String);
			expectedFields.region    = String;
			expectedFields.replicaOf = Match.Optional(String);
			expectedFields.groups    = Match.Optional([String]);
		}

		check(changes, expectedFields);
		check(comment, Match.Maybe(String));

		var user = Meteor.user();
		if (!user) {
			if (Meteor.isClient) {
				PleaseLogin();
				return;
			} else {
				throw new Meteor.Error(401, "please log in");
			}
		}

		var now = new Date();

		changes.time_lastedit = now;

		var event = false;
		if (isNew) {
			changes.time_created = now;
			if (changes.courseId) {
				var course = Courses.findOne(changes.courseId);
				if (!course) throw new Meteor.Error(404, "course not found");
				if (!course.editableBy(user)) throw new Meteor.Error(401, "not permitted");
			}

			if (changes.replicaOf) {
				const parent = Events.findOne(changes.replicaOf);
				if (!parent) throw new Meteor.Error(404, "replica parent not found");
				if (parent.courseId !== changes.courseId) {
					throw new Meteor.Error(400, "replica must be in same course");
				}
			}

			if (!changes.startLocal) {
				throw new Meteor.Error(400, "Event date not provided");
			}

			var tested_groups = [];
			if (changes.groups) {
				tested_groups = _.map(changes.groups, function(groupId) {
					var group = Groups.findOne(groupId);
					if (!group) throw new Meteor.Error(404, "no group with id "+groupId);
					return group._id;
				});
			}
			changes.groups = tested_groups;

			// Coerce faulty end dates
			if (!changes.endLocal || changes.endLocal < changes.startLocal) {
				changes.endLocal = changes.startLocal;
			}

			changes.internal = !!changes.internal;

			// Synthesize event document because the code below relies on it
			event = _.extend(new OEvent(), { region: changes.region, courseId: changes.courseId, editors: [user._id] });
		} else {
			event = Events.findOne(eventId);
			if (!event) throw new Meteor.Error(404, "No such event");
		}

		if (!event.editableBy(user)) throw new Meteor.Error(401, "not permitted");

		var region = Regions.findOne(event.region);

		if (!region) {
			throw new Meteor.Error(400, "Region not found");
		}

		var regionZone = LocalTime.zone(region._id);

		// Don't allow moving past events or moving events into the past
		// This section needs a rewrite even more than the rest of this method
		if (changes.startLocal) {
			var startMoment = regionZone.fromString(changes.startLocal);
			if (!startMoment.isValid()) throw new Meteor.Error(400, "Invalid start date");

			if (startMoment.isBefore(new Date())) {
				if (isNew) throw new Meteor.Error(400, "Event start in the past");

				// No changing the date of past events
				delete changes.startLocal;
				delete changes.endLocal;
			} else {
				changes.startLocal = regionZone.toString(startMoment); // Round-trip for security
				changes.start = startMoment.toDate();

				var endMoment;
				if (changes.endLocal) {
					endMoment = regionZone.fromString(changes.endLocal);
					if (!endMoment.isValid()) throw new Meteor.Error(400, "Invalid end date");
				} else {
					endMoment = regionZone.fromString(event.endLocal);
				}

				if (endMoment.isBefore(startMoment)) {
					endMoment = startMoment; // Enforce invariant
				}
				changes.endLocal = regionZone.toString(endMoment);
				changes.end = endMoment.toDate();
			}
		}


		if (Meteor.isServer) {
			const sanitizedDescription = StringTools.saneText(changes.description);
			changes.description = HtmlTools.saneHtml(sanitizedDescription);
		}

		if (changes.title) {
			changes.title = StringTools.saneTitle(changes.title).substring(0, 1000);
			changes.slug = StringTools.slug(changes.title);
		}

		let affectedReplicaCount = 0;
		if (isNew) {
			changes.createdBy = user._id;
			changes.groupOrganizers = [];
			eventId = Events.insert(changes);
		} else {
			Events.update(eventId, { $set: changes });

			if (updateReplicas) {
				const replicaSync = ReplicaSync(event, updateChangedReplicas);
				replicaSync.apply(changes);
				affectedReplicaCount = replicaSync.affected();
			}
		}

		if (sendNotifications) {
			if (affectedReplicaCount) {
				const affectedReplicaMessage = mf(
					'notification.event.affectedReplicaMessage',
					{ NUM: affectedReplicaCount },
					'These changes have also been applied to {NUM, plural, one {the later copy} other {# later copies}}'
				);

				if (comment == null) {
					comment = affectedReplicaMessage;
				} else {
					comment = `${affectedReplicaMessage}\n\n${comment}`;
				}
			}

			if (comment != null) comment = comment.trim().substr(0, 2000);

			Notification.Event.record(eventId, isNew, comment);
		}

		if (Meteor.isServer) {

			Meteor.call('event.updateVenue', eventId, AsyncTools.logErrors);
			Meteor.call('event.updateGroups', eventId, AsyncTools.logErrors);
			Meteor.call('region.updateCounters', event.region, AsyncTools.logErrors);

			// the assumption is that all replicas have the same course if any
			if (event.courseId) Meteor.call('course.updateNextEvent', event.courseId, AsyncTools.logErrors);
		}

		return eventId;
	},


	'event.remove': function(eventId) {
		check(eventId, String);

		var user = Meteor.user();
		if (!user) throw new Meteor.Error(401, "please log in");
		var event = Events.findOne(eventId);
		if (!event) throw new Meteor.Error(404, "No such event");
		if (!event.editableBy(user)) throw new Meteor.Error(401, "not permitted");

		Events.remove(eventId);

		if (event.courseId) Meteor.call('course.updateNextEvent', event.courseId);
		Meteor.call('region.updateCounters', event.region, AsyncTools.logErrors);
	},


	// Update the venue field for all events matching the selector
	'event.updateVenue': function(selector) {
		var idOnly = { fields: { _id: 1 } };
		Events.find(selector, idOnly).forEach(function(event) {
			const eventId = event._id;

			AsyncTools.untilClean(function() {
				var event = Events.findOne(eventId);
				if (!event) return true; // Nothing was successfully updated, we're done.

				if (!_.isObject(event.venue)) {
					// This happens only at creation when the field was not initialized correctly
					Events.update(event._id, { $set:{ venue: {} }});
					return false;
				}

				var venue = false;
				if (event.venue._id) {
					venue = Venues.findOne(event.venue._id);
				}

				var update;
				if (venue) {
					// Do not update venue for historical events
					if (event.start < new Date()) return true;

					// Sync values to the values set in the venue document
					update = { $set: {
						'venue.name':    venue.name,
						'venue.address': venue.address,
						'venue.loc':     venue.loc
					}};
				} else {
					// If the venue vanished from the DB we delete the reference but let the cached fields live on
					update = { $unset: { 'venue._id': 1 }};
				}

				// We have to use the Mongo collection API because Meteor does not
				// expose the modification counter
				var r = Events.rawCollection();
				var result = Meteor.wrapAsync(r.update, r)(
					{ _id: event._id },
					update,
					{ fullResult: true }
				);

				return result.result.nModified === 0;
			});
		});
	},

	// Update the group-related fields of events matching the selector
	'event.updateGroups': function(selector) {
		var idOnly = { fields: { _id: 1 } };
		Events.find(selector, idOnly).forEach(function(event) {
			Events.updateGroups(event._id);
		});
	},


	/** Add or remove a group from the groups list
	  *
	  * @param {String} eventId - The event to update
	  * @param {String} groupId - The group to add or remove
	  * @param {Boolean} add - Whether to add or remove the group
	  *
	  */
	'event.promote': UpdateMethods.Promote(Events),


	/** Add or remove a group from the groupOrganizers list
	  *
	  * @param {String} eventId - The event to update
	  * @param {String} groupId - The group to add or remove
	  * @param {Boolean} add - Whether to add or remove the group
	  *
	  */
	'event.editing': UpdateMethods.Editing(Events),
});
