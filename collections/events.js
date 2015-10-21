// ======== DB-Model: ========
// "_id" -> ID
// "title" -> string
// "description" -> string
//
// start:      Time the events starts
//
// end:        Time the event ends
//
// locationId: Reference to a document in the Locations collection
//             If this is set, the fields locationName, loc, and address are synchronized
//
// locationName: Descriptive name for the location
//
// loc:        Event location in GeoJSON format
//
// address:    Address string where the event will take place
//
// room:       Where inside the building the event will take place
//
// "createdBy" -> userId
// "time_created" -> timestamp
// "time_lastedit" -> timestamp
// "course_id" -> ID_course          (maybe list in Future)
// ===========================

Events = new Meteor.Collection("Events");
if (Meteor.isServer) Events._ensureIndex({loc : "2dsphere"});


mayEditEvent = function(user, event) {
	if (!user) return false;
	if (event.createdBy == user._id) return true;
	if (privileged(user, 'admin')) return true;
	if (event.course_id) {
		var course = Courses.findOne({_id: event.course_id, members: {$elemMatch: { user: user._id, roles: 'team' }}});
		if (course) return true;
	}
	return false;
}

affectedReplicaSelectors = function(event) {
	// Only replicas future from the edited event are updated
	// replicas in the past are never updated
	var futureDate = event.start;
	if (futureDate < new Date) futureDate = new Date;
	
	var selector = {
		_id: { $ne: event._id }, // so the event is not considered to be its own replica
		start: { $gte: futureDate }
	};
	
	var selectors;
	if (event.replicaOf) {
		selector.$or = [
			{ replicaOf: event.replicaOf },
			{ _id: event.replicaOf }
		];
	} else {
		selector.replicaOf = event._id;
	}

	return selector;
}

Meteor.methods({
	saveEvent: function(eventId, changes, updateReplicas) {
		check(eventId, String);
		
		var expectedFields = {
			title:       String,
			description: String,
			location:    String,
			room:        Match.Optional(String),
			start:       Match.Optional(Date),
			end:         Match.Optional(Date),
			files:       Match.Optional(Array),
			mentors:	 Match.Optional(Array),
			host:        Match.Optional(Array),
			replicaOf:   Match.Optional(String),
			course_id:	 Match.Optional(String),
			groups:	     Match.Optional([String]),
			loc:         Match.Optional(Object) // Dirty, should restrict to geojson
		};
		
		var isNew = eventId === '';
		if (isNew) {
			expectedFields.region = String;
		}

		check(changes, expectedFields);
		
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
			if (changes.course_id && !mayEditEvent(user, changes)) {
				throw new Meteor.Error(401, "not permitted");
			}		

			if (!changes.start || changes.start < now) {
				throw new Meteor.Error(400, "Event date in the past or not provided");
			}

			if (changes.course_id) {
				// Inherit groups from the course
				var course = Courses.findOne(changes.course_id);
				changes.groups = course.groups;
			} else {
				var tested_groups = [];
				if (changes.groups) {
					tested_groups = _.map(changes.groups, function(groupId) {
						var group = Groups.findOne(groupId);
						if (!group) throw new Meteor.Error(404, "no group with id "+groupId);
						return group._id;
					});
				}
				changes.groups = tested_groups;
			}

			// Coerce faulty end dates
			if (!changes.end || changes.end < changes.start) {
				changes.end = changes.start;
			}
		} else {
			event = Events.findOne(eventId);
			if (!event) throw new Meteor.Error(404, "No such event");
			if (!mayEditEvent(user, event)) throw new Meteor.Error(401, "not permitted");

			// Not allowed to update
			delete changes.replicaOf;
			delete changes.groups;
		}

		// Don't allow moving past events or moving events into the past
		if (!changes.start || changes.start < now) {
			changes.start = event.start;
		}

		if (changes.end && changes.end < changes.start) {
			throw new Meteor.Error(400, "End before start");
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
			var eventId = Events.insert(changes);
		} else {
			Events.update(eventId, { $set: changes });
			
			if (updateReplicas) {
				delete changes.start;
				delete changes.end;

				Events.update(affectedReplicaSelectors(event), { $set: changes }, { multi: true });
			}
		}

		return eventId;
	},


	removeEvent: function(eventId) {
		check(eventId, String);

		var user = Meteor.user()
		if (!user) throw new Meteor.Error(401, "please log in");
		var event = Events.findOne(eventId);
		if (!event) throw new Meteor.Error(404, "No such event");
		if (!mayEditEvent(user, event)) throw new Meteor.Error(401, "not permitted");

		Events.remove(eventId);
		return Events.findOne({id:eventId}) === undefined;
	},


	removeFile: function(eventId,fileId) {
		check(eventId, String);
		
		var user = Meteor.user()
		if (!user) throw new Meteor.Error(401, "please log in");
		var event = Events.findOne(eventId);
		if (!event) throw new Meteor.Error(404, "No such event");
		if (!mayEditEvent(user, event)) throw new Meteor.Error(401, "not permitted");
		
		var tmp = []	
		
		for(var i = 0; i < event.files.length; i++ ){
			var fileObj = event.files[i];
			if( fileObj._id != fileId){
				tmp.push(fileObj);
			}
		};

		var edits = {
			files: tmp,
		}
		var upd = Events.update(eventId, { $set: edits });
		return upd;
	}

});


/* Find events for given filters
 *
 * filter: dictionary with filter options
 *   query: string of words to search for
 *   period: include only events that overlap the given period (list of start and end date)
 *   after: only events starting after this date
 *   ongoing: only events that are ongoing during this date
 *   before: only events that ended before this date
 *   location: only events at this location (string match)
 *   room: only events in this room (string match)
 *   standalone: only events that are not attached to a course
 *   region: restrict to given region
 *   categories: list of category ID the event must be in
 *   group: the event must be in that group (ID)
 * limit: how many to find
 *
 * The events are sorted by start date (ascending, before-filter causes descending order)
 *
 */
eventsFind = function(filter, limit) {
	var find = {};
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
	
	if (filter.after) {
		find.start = { $gt: filter.after };
	}

	if (filter.ongoing) {
		find.start = { $lte: filter.ongoing };
		find.end = { $gte: filter.ongoing };
	}

	if (filter.before) {
		find.end = { $lt: filter.before };
		if (!filter.after) options.sort = { start: -1 }
	}

	if (filter.location) {
		find.location = filter.location;
	}

	if (filter.room) {
		find.room = filter.room;
	}
	
	if (filter.standalone) {
		find.course_id = { $exists: false };
	}
	
	if (filter.region) {
		find.region = filter.region;
	}

	if (filter.categories) {
		find.categories = { $all: filter.categories };
	}

	if (filter.group) {
		find.groups = filter.group;
	}
	
	if (filter.search) {
		var searchTerms = filter.search.split(/\s+/);
		var searchQueries = _.map(searchTerms, function(searchTerm) {
			return { $or: [
				{ title: { $regex: escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: escapeRegex(searchTerm), $options: 'i' } }
			] }
		});

		find.$and = searchQueries;
	}
	return Events.find(find, options);
}
