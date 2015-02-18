// ======== DB-Model: ========
// "_id" -> ID
// "title" -> string
// "description" -> string
// "mentors" -> [userIDs]   optional
// "startdate" -> ISODate
// "host" -> [userIDs]     optional
// "location" -> ...............
// "createdby" -> userId
// "time_created" -> timestamp
// "time_lastedit" -> timestamp
// "course_id" -> ID_course          (maybe list in Future)
// ===========================

Events = new Meteor.Collection("Events");


Events.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && true;	// allow only if UserId is present
	},
	insert: function (userId, doc) {
		return userId && true;	// allow only if UserId is present
	},
	remove: function (userId, doc) {
		return userId && true;	// allow only if UserId is present
	}
});

eventsFind = function(fromDate, limit) {
	var find = { 
		startdate: { $gt: fromDate }
	};

	var options = { 
		limit: limit,
		sort: { startdate: 1 } 
	};

	return Events.find(find, options);
} 


eventsSearch = function(query, standalone, limit) {
	var find = {startdate: {$gt: new Date()}};
	
	if (standalone) {
		find.course_id = { $exists: false } // We're not $exists 
	}
	
	if (query) {
		var searchTerms = query.split(/\s+/);
		var searchQueries = _.map(searchTerms, function(searchTerm) {
			return { $or: [
				{ title: { $regex: escapeRegex(searchTerm), $options: 'i' } },
								  { description: { $regex: escapeRegex(searchTerm), $options: 'i' } }
			] }
		});
		
		find.$and = searchQueries;
	}
	
	var options = { 
		limit: limit,
		sort: { startdate: 1 } 
	};
	return Events.find(find, options);
} 