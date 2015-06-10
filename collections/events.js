// ======== DB-Model: ========
// "_id" -> ID
// "title" -> string
// "description" -> string
// "mentors" -> [userIDs]   optional
// "startdate" -> ISODate
// "host" -> [userIDs]     optional
// "location" -> ...............
// "createdBy" -> userId
// "time_created" -> timestamp
// "time_lastedit" -> timestamp
// "course_id" -> ID_course          (maybe list in Future)
// ===========================

Events = new Meteor.Collection("Events");

mayEditEvent = function(user, event) {
	if (event.createdBy == user._id) return true;
	if (privileged(user, 'admin')) return true;
	if (event.course_id) {
		var course = Courses.findOne({_id: event.course_id, members: {$elemMatch: { user: user._id, roles: 'team' }}});
		if (course) return true;
	}
	return false;
}

Meteor.methods({
	saveEvent: function(eventId, changes) {
		check(eventId, String);
		
		var expectedFields = {
			title:       String,
			description: String,
			location:    String,
			room:        Match.Optional(String),
			startdate:   Date,
			enddate:     Date,
			files:       Match.Optional(Array),
			mentors:	 Match.Optional(Array),
			host:	 	 Match.Optional(Array),
			replicaOf:	 Match.Optional(String),
			course_id:	Match.Optional(String),
		};
		
		var isNew = eventId === '';
		if (isNew) {
			expectedFields.region = String;
		//	expectedFields.course_id = Match.Optional(String);
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
		
		if (isNew) {
			changes.time_created = now;
			if (changes.course_id && !mayEditEvent(user, changes)) {
				throw new Meteor.Error(401, "not permitted");
			}
		} else {
			var event = Events.findOne(eventId);
			if (!event) throw new Meteor.Error(404, "No such event");
			if (!mayEditEvent(user, event)) throw new Meteor.Error(401, "not permitted");
		}
		
		if (changes.startdate < now) {
			throw new Meteor.Error(400, "Can't edit events in the past");
		}
		
		if (changes.enddate < changes.startdate) {
			throw new Meteor.Error(400, "Enddate before startdate");
		}
		
		if (Meteor.isServer) {
			changes.description = saneHtml(changes.description);
		}
		
		if (isNew) {
			changes.createdBy = user._id;
			var eventId = Events.insert(changes);
		} else {
			Events.update(eventId, { $set: changes });		
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

	updateReplicas: function(eventId,changes){

		//update the replicas of this event
		delete changes.startdate;
		delete changes.enddate; 
		Events.update( { replicaOf: eventId }, { $set: changes }, { multi:true} );
		//and the event of which this is a replica, and that event's other replicas
		var repEventId = changes.replicaOf;
		if(repEventId != undefined){
			Events.update( repEventId, { $set: changes }, { multi:true} );
			Events.update( { replicaOf: repEventId }, { $set: changes }, { multi:true} );	
		}
		
	},
	
	
	
	getReplicas: function(eventId){
			
		var results =  Events.find( { replicaOf: eventId } ).fetch().length ;
		return results;
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
 *   after: only events starting after this date
 *   ongoing: only events that are ongoing during this date
 *   before: only events that ended before this date
 *   location: only events at this location (string match)
 *   room: only events in this room (string match)
 *   standalone: only events that are not attached to a course
 *   region: restrict to given region
 * limit: how many to find
 *
 * The events are sorted by startdate (ascending, before-filter causes descending order)
 *
 */
eventsFind = function(filter, limit) {
	var find = {};
	var options = {
		sort: { startdate: 1 }
	};

	if (limit > 0) {
		options.limit = limit;
	}
	
	if (filter.after) {
		find.startdate = { $gt: filter.after };
	}

	if (filter.ongoing) {
		find.startdate = { $lte: filter.ongoing };
		find.enddate = { $gte: filter.ongoing };
	}

	if (filter.before) {
		find.enddate = { $lt: filter.before };
		if (!filter.after) options.sort = { startdate: -1 }
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
	
	if (filter.query) {
		var searchTerms = filter.query.split(/\s+/);
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
