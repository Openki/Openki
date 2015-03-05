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

if (Meteor.isServer) {
	Events.before.insert(function(userId, event) {
		event.time_created = new Date();
		event.time_lastedit = event.time_created;
		event.description = saneHtml(event.description);
	});

	Events.before.update(function(userId, event, _, set) {
		set.$set.time_lastedit = new Date();
		set.$set.description = saneHtml(set.$set.description);
	});
}

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

