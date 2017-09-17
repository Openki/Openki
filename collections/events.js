import '/imports/notification/Notification.js';
import '/imports/LocalTime.js';

// ======== DB-Model: ========
// _id             -> ID
// region          -> ID_region
// title           -> String
// description     -> String
// startLocal      -> String of local date when event starts
// endLocal        -> String of local date when event ends
//
// venue {
//       _id:          Optional reference to a document in the Venues collection
//                         If this is set, the fields name, loc, and address are synchronized
//       name:         Descriptive name for the venue
//       loc:          Event location in GeoJSON format
//       address:      Address string where the event will take place
// }
// room            -> String    (Where inside the building the event will take place)
// createdBy       -> userId
// time_created    -> Date
// time_lastedit   -> Date
// courseId        -> course._id of parent course, optional
// internal        -> Boolean    (Events are only displayed when group or venue-filter is active)

// groups          -> list of group._id that promote this event
// groupOrganizers -> list of group._id that are allowed to edit the course

// replicaOf       -> ID of the replication parent, only cloned events have this


/** Calculated fields
  *
  * courseGroups: list of group._id inherited from course (if courseId is set)
  * allGroups: all groups that promote this course, both inherited from course and set on the event itself
  * editors: list of user and group _id that are allowed to edit the event
  * start: date object calculated from startLocal field. Use this for ordering
  *           between events.
  * end: date object calculated from endLocal field.
  */

// ===========================

// Unreasonable HACK: Because Event is a browser API class we can't use that name
OEvent = function() {
	this.editors = [];
};

OEvent.prototype.editableBy = function(user) {
	if (!user) return false;
	if (privileged(user, 'admin')) return true;
	return _.intersection(user.badges, this.editors).length > 0;
};

Events = new Meteor.Collection("Events", {
	transform: function(event) {
		return _.extend(new OEvent(), event);
	}
});


affectedReplicaSelectors = function(event) {
	// If the event itself is not in the DB, we don't expect it to have replicas
	if (!event._id) return { _id: -1 }; // Finds nothing

	// Only replicas future from the edited event are updated
	// replicas in the past are never updated
	var futureDate = event.start;
	if (futureDate < new Date()) futureDate = new Date();

	var selector = {
		_id: { $ne: event._id }, // so the event is not considered to be its own replica
		start: { $gte: futureDate }
	};

	if (event.replicaOf) {
		selector.$or = [
			{ replicaOf: event.replicaOf },
			{ _id: event.replicaOf }
		];
	} else {
		selector.replicaOf = event._id;
	}

	return selector;
};

// Sync venue fields of the event document
updateEventVenue = function(eventId) {
	untilClean(function() {
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
};


/** @summary recalculate the group-related fields of an event
  * @param {eventId} the event to update
  */
Events.updateGroups = function(eventId) {
	untilClean(function() {
		var event = Events.findOne(eventId);
		if (!event) return true; // Nothing was successfully updated, we're done.

		// The creator of the event as well as any groups listed as organizers
		// are allowed to edit.
		var editors = event.groupOrganizers.slice(); // Clone
		if (event.createdBy) editors.push(event.createdBy);

		// If an event has a parent course, it inherits all groups and all editors from it.
		var courseGroups = [];
		if (event.courseId) {
			course = Courses.findOne(event.courseId);
			if (!course) throw new Exception("Missing course " + event.courseId + " for event " + event._id);

			courseGroups = course.groups;
			editors = _.union(editors, course.editors);
		}

		var update = {
			editors: editors
		};

		// The course groups are only inherited if the event lies in the future
		// Past events keep their list of groups even if it changes for the course
		var historical = event.start < new Date();
		if (historical) {
			update.allGroups = _.union(event.groups, event.courseGroups);
		} else {
			update.courseGroups = courseGroups;
			update.allGroups = _.union(event.groups, courseGroups);
		}

		var r = Events.rawCollection();
		var result = Meteor.wrapAsync(r.update, r)(
			{ _id: event._id },
			{ $set: update },
			{ fullResult: true }
		);

		return result.result.nModified === 0;
	});
};


Meteor.methods({
	saveEvent: function(eventId, changes, updateReplicas, sendNotifications, comment) {
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
				pleaseLogin();
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
			changes.description = saneHtml(changes.description);
		}

		if (changes.title) {
			changes.title = saneText(changes.title).substring(0, 1000);
			changes.slug = getSlug(changes.title);
		}

		if (isNew) {
			changes.createdBy = user._id;
			changes.groupOrganizers = [];
			eventId = Events.insert(changes);
		} else {
			Events.update(eventId, { $set: changes });

			if (updateReplicas) {
				delete changes.start;
				delete changes.startLocal;
				delete changes.end;
				delete changes.endLocal;

				Events.update(affectedReplicaSelectors(event), { $set: changes }, { multi: true });
			}
		}

		if (sendNotifications) {
			if(comment != null) comment = comment.trim().substr(0, 2000);
			Notification.Event.record(eventId, isNew, comment);
		}

		if (Meteor.isServer) {

			Meteor.call('updateEventVenue', eventId, logAsyncErrors);
			Meteor.call('event.updateGroups', eventId, logAsyncErrors);
			Meteor.call('updateRegionCounters', event.region, logAsyncErrors);

			// the assumption is that all replicas have the same course if any
			if (event.courseId) Meteor.call('updateNextEvent', event.courseId, logAsyncErrors);
		}

		return eventId;
	},


	removeEvent: function(eventId) {
		check(eventId, String);

		var user = Meteor.user();
		if (!user) throw new Meteor.Error(401, "please log in");
		var event = Events.findOne(eventId);
		if (!event) throw new Meteor.Error(404, "No such event");
		if (!event.editableBy(user)) throw new Meteor.Error(401, "not permitted");

		Events.remove(eventId);

		if (event.courseId) Meteor.call('updateNextEvent', event.courseId);
		Meteor.call('updateRegionCounters', event.region, logAsyncErrors);
	},


	// Update the venue field for all events matching the selector
	updateEventVenue: function(selector) {
		var idOnly = { fields: { _id: 1 } };
		Events.find(selector, idOnly).forEach(function(event) {
			updateEventVenue(event._id);
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


/* Find events for given filters
 *
 * filter: dictionary with filter options
 *   search: string of words to search for
 *   period: include only events that overlap the given period (list of start and end date)
 *   start: only events that end after this date
 *   before: only events that ended before this date
 *   ongoing: only events that are ongoing during this date
 *   end: only events that started before this date
 *   after: only events starting after this date
 *   venue: only events at this venue (ID)
 *   room: only events in this room (string match)
 *   standalone: only events that are not attached to a course
 *   region: restrict to given region
 *   categories: list of category ID the event must be in
 *   group: the event must be in that group (ID)
 *   groups: the event must be in one of the group ID
 *   course: only events for this course (ID)
 *   internal: only events that are internal (if true) or public (if false)
 * limit: how many to find
 *
 * The events are sorted by start date (ascending, before-filter causes descending order)
 *
 */
eventsFind = function(filter, limit) {
	var find = {};
	var and = [];
	var options = {
		sort: { start: 1 }
	};

	if (limit > 0) {
		options.limit = limit;
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
		if (!filter.after) options.sort = { start: -1 };
	}

	if (filter.venue) {
		find['venue._id'] = filter.venue;
	}

	if (filter.room) {
		find.room = filter.room;
	}

	if (filter.standalone) {
		find.courseId = { $exists: false };
	}

	if (filter.region) {
		find.region = filter.region;
	}

	if (filter.categories) {
		find.categories = { $all: filter.categories };
	}

	var inGroups = [];
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
		find.internal = !!filter.internal;
	}

	if (filter.search) {
		var searchTerms = filter.search.split(/\s+/);
		searchTerms.forEach(function(searchTerm) {
			and.push({ $or: [
				{ title: { $regex: escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: escapeRegex(searchTerm), $options: 'i' } }
			] });
		});
	}

	if (and.length > 0) {
		find.$and = and;
	}

	return Events.find(find, options);
};
