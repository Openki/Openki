import { Mongo } from 'meteor/mongo';
import { _ } from 'meteor/underscore';
import { Match, check } from 'meteor/check';
// eslint-disable-next-line import/no-cycle
import * as tenantDenormalizer from './tenantDenormalizer';

import { Geodata } from '/imports/api/regions/regions';
import { Courses } from '/imports/api/courses/courses';
import { UserModel } from '/imports/api/users/users';

import { AsyncTools } from '/imports/utils/async-tools';
import { Filtering } from '/imports/utils/filtering';
import LocalTime from '/imports/utils/local-time';
import * as Predicates from '/imports/utils/predicates';
import * as StringTools from '/imports/utils/string-tools';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { PublicSettings } from '/imports/utils/PublicSettings';

export interface EventVenueEntity {
	/**
	 * Optional reference to a document in the Venues collection. If this is set, the fields
	 * name, loc, and address are synchronized
	 */
	_id?: string;
	/** Descriptive name for the venue */
	name?: string;
	/** Event location in GeoJSON format */
	loc?: Geodata;
	/** Address string where the event will take place */
	address?: string;
	editor?: string;
}

/** DB-Model */
export interface EventEntity {
	/** ID */
	_id: string;
	/** tenant ID */
	tenant: string;
	/** ID_region */
	region: string;
	title: string;
	slug: string;
	description: string;
	/** String of local date when event starts */
	startLocal: string;
	/** String of local date when event ends */
	endLocal: string;
	venue?: EventVenueEntity;
	/** (Where inside the building the event will take place) */
	room: string;
	/** userId */
	createdBy: string;
	// eslint-disable-next-line camelcase
	time_created: Date;
	// eslint-disable-next-line camelcase
	time_lastedit: Date;
	/** course._id of parent course, optional */
	courseId?: string;
	/** (Events are only displayed when group or venue-filter is active) */
	internal: boolean;
	/** list of group._id that promote this event ("promote groups"). */
	groups: string[];
	/**
	 * list of group._id that are allowed to edit the course ("team groups", based on the ui design:
	 * Every "team group" promotes the event and is part of the groups list). */
	groupOrganizers: string[];
	/** ID of the replication parent, only cloned events have this */
	replicaOf?: string;
	participants?: string[];
	/** maximum participants of event */
	maxParticipants: number;
	/**
	 * (calculated) list of group._id inherited from course (if courseId is set) ("promote groups"
	 * from course)
	 */
	courseGroups: string[];
	/**
	 * (calculated) all groups that promote this course, both inherited from course and set on the
	 * event itself ("promote groups" from event and course)
	 */
	allGroups: string[];
	/**
	 * (calculated) list of user and group _id that are allowed to edit the event, calculated from
	 * the groupOranizers from the event and the editors from the course
	 */
	editors: string[];
	/**
	 * (calculated) date object calculated from startLocal field. Use this for ordering between
	 * events.
	 */
	start: Date;
	/** (calculated) date object calculated from endLocal field. */
	end: Date;
}

export type EventModel = OEvent & EventEntity;

// Event is a built-in, so we use a different name for this class
export class OEvent {
	editors: string[] = [];

	isPrivate(this: EventModel) {
		return !PublicSettings.publicTenants.includes(this.tenant);
	}

	editableBy(this: EventModel, user: UserModel) {
		if (!user) {
			return false;
		}
		if (UserPrivilegeUtils.privileged(user, 'admin')) {
			return true;
		}
		return _.intersection(user.badges, this.editors).length > 0;
	}

	sameTime(
		this: { startLocal: string; endLocal: string },
		event: { startLocal: string; endLocal: string },
	) {
		return ['startLocal', 'endLocal'].every((time) => {
			const timeA = LocalTime.fromString((this as any)[time]);
			const timeB = LocalTime.fromString((event as any)[time]);

			return timeA.hour() === timeB.hour() && timeA.minute() === timeB.minute();
		});
	}
}

export interface FindFilter {
	/** string of words to search for */
	search?: string;
	/** include only events that overlap the given
	 * period (list of start and end date) */
	period?: [Date, Date];
	/** only events that end after this date */
	start?: Date;
	/** only events that ended before this date */
	before?: Date;
	/** only events that are ongoing during this date */
	ongoing?: Date;
	/** only events that started before this date */
	end?: Date;
	/**  only events starting after this date */
	after?: Date;
	/** only events at this venue (ID) */
	venue?: string;
	/** only events at this venues (IDs) */
	venues?: string[];
	/** only events in this room (string match) */
	room?: string;
	/** only events that are not attached to a course */
	standalone?: boolean;
	/** restrict to given region */
	region?: string;
	/** restrict to given tenants */
	tenants?: string[];
	/** list of category ID the event must be in */
	categories?: string[];
	/** the event must be in that group (ID) */
	group?: string;
	/** the event must be in one of the group ID */
	groups?: string[];
	/** only events for this course (ID) */
	course?: string;
	/** only events that are internal (if true) or public (if false) */
	internal?: boolean;
}

export class EventsCollection extends Mongo.Collection<EventEntity, EventModel> {
	constructor() {
		super('Events', {
			transform(event) {
				return _.extend(new OEvent(), event);
			},
		});

		if (Meteor.isServer) {
			this.createIndex({ tenant: 1, region: 1, start: 1 });
			this.createIndex({ tenant: 1, region: 1, end: 1 });
			this.createIndex({ tenant: 1, region: 1, 'venue._id': 1 });
			this.createIndex({ tenant: 1, region: 1, allGroups: 1 });
		}
	}

	insert(event: EventModel, callback?: (err: any | undefined, _id?: string) => void) {
		const enrichedEvent = tenantDenormalizer.beforeInsert(event);

		return super.insert(enrichedEvent, callback);
	}

	// eslint-disable-next-line class-methods-use-this
	Filtering() {
		return new Filtering({
			course: Predicates.id,
			region: Predicates.id,
			search: Predicates.string,
			categories: Predicates.ids,
			group: Predicates.id,
			groups: Predicates.ids,
			venue: Predicates.id,
			venues: Predicates.ids,
			room: Predicates.string,
			start: Predicates.date,
			before: Predicates.date,
			after: Predicates.date,
			end: Predicates.date,
			internal: Predicates.flag,
		});
	}

	/**
	 * Recalculate the group-related fields of an event
	 * @param {string} eventId the event to update
	 */
	updateGroups(eventId: string) {
		AsyncTools.untilClean((resolve, reject) => {
			const event = this.findOne(eventId);

			if (!event) {
				// Nothing was successfully updated, we're done.
				resolve(true);
				return;
			}

			// Any groups listed as organizers are allowed to edit.
			let editors = event.groupOrganizers.slice(); // Clone

			// If an event has a parent course, it inherits all groups and all editors from it.
			/** @type {string[]} */
			let courseGroups: string[] = [];
			if (event.courseId) {
				const course = Courses.findOne(event.courseId);
				if (!course) {
					throw new Error(`Missing course ${event.courseId} for event ${event._id}`);
				}

				courseGroups = course.groups;
				editors = _.union(editors, course.editors);
			} else {
				editors.push(event.createdBy);
			}

			const update: Partial<EventEntity> = {
				editors,
			};

			// The course groups are only inherited if the event lies in the future
			// Past events keep their list of groups even if it changes for the course
			const historical = event.start < new Date();
			if (historical) {
				update.allGroups = _.union(event.groups, event.courseGroups);
			} else {
				update.courseGroups = courseGroups;
				update.allGroups = _.union(event.groups, courseGroups);
			}

			this.rawCollection().update({ _id: event._id }, { $set: update }, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result.result.nModified === 0);
				}
			});
		});
	}

	/**
	 * Find events for given filters
	 * @param filter dictionary with filter options
	 * @param limit how many to find
	 * @param skip skip this many before returning results
	 * @param sort list of fields to sort by
	 *
	 * The events are sorted by start date (ascending, before-filter causes descending order)
	 */
	findFilter(filter: FindFilter = {}, limit = 0, skip = 0, sort?: [string, 'asc' | 'desc'][]) {
		check(limit, Match.Maybe(Number));
		check(skip, Match.Maybe(Number));
		check(sort, Match.Maybe([[String]]));

		const find: Mongo.Selector<EventEntity> = {};
		const and = [];

		const options: Mongo.Options<EventEntity> = {};
		options.sort = Array.isArray(sort) ? sort : [];

		let startSortOrder = 'asc';

		if (limit > 0) {
			options.limit = limit;
		}

		if (skip > 0) {
			options.skip = skip;
		}

		if (filter.period) {
			find.start = { $lt: filter.period[1] }; // Start date before end of period
			find.end = { $gte: filter.period[0] }; // End date after start of period
		}

		if (filter.start) {
			and.push({ end: { $gte: filter.start } });
		}

		if (filter.end) {
			and.push({ start: { $lte: filter.end } });
		}

		if (filter.after) {
			find.start = { $gt: filter.after };
		}

		if (filter.ongoing) {
			find.start = { $lte: filter.ongoing };
			find.end = { $gte: filter.ongoing };
		}

		if (filter.before) {
			find.end = { $lt: filter.before };
			if (!filter.after) {
				startSortOrder = 'desc';
			}
		}

		let inVenues = [];
		if (filter.venue) {
			inVenues.push(filter.venue);
		}

		if (filter.venues) {
			inVenues = inVenues.concat(filter.venues);
		}

		if (inVenues.length > 0) {
			find['venue._id'] = { $in: inVenues };
		}

		if (filter.room) {
			find.room = filter.room;
		}

		if (filter.standalone) {
			find.courseId = { $exists: false };
		}

		if (filter.tenants && filter.tenants.length > 0) {
			find.tenant = { $in: filter.tenants };
		}

		if (filter.region) {
			find.region = filter.region;
		}

		if (filter.categories) {
			find.categories = { $all: filter.categories };
		}

		let inGroups = [];
		if (filter.group) {
			inGroups.push(filter.group);
		}

		if (filter.groups) {
			inGroups = inGroups.concat(filter.groups);
		}

		if (inGroups.length > 0) {
			find.allGroups = { $in: inGroups };
		}

		if (filter.course) {
			find.courseId = filter.course;
		}

		if (filter.internal !== undefined) {
			find.internal = Boolean(filter.internal);
		}

		if (filter.search) {
			const searchTerms = filter.search.split(/\s+/);
			searchTerms.forEach((searchTerm) => {
				and.push({
					$or: [
						{ title: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
						{ description: { $regex: StringTools.escapeRegex(searchTerm), $options: 'i' } },
					],
				});
			});
		}

		if (and.length > 0) {
			find.$and = and;
		}

		(options.sort as string[][]).push(['start', startSortOrder]);

		return this.find(find, options) as Mongo.Cursor<EventEntity, EventModel>;
	}
}

export const Events = new EventsCollection();

export default Events;
