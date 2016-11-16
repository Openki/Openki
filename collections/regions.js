// ======== DB-Model: ========
// _id              -> ID
// name             -> String
// loc              -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// timeZone         -> String,  ex: "UTC+01:00"
// courseCount      -> Number of courses in that region, calculated field
// proposalCount    -> Number of proposals (courses without events) in that region, calculated field
// futureEventCount -> Number of future events in that region, calculated field
// pastEventCount   -> Number of past events in that region, calculated field
// groups           -> active groups in region, calculatet field: [{groupId: ..., name: ..., weight: count of Courses in this group}]
// ===========================

Regions = new Meteor.Collection("Regions");
if (Meteor.isServer) Regions._ensureIndex({loc : "2dsphere"});

// We don't use untilClean() here because consistency doesn't matter
updateRegionCounters = function(regionId) {
	var courseCount = Courses.find({ region: regionId }).count();
	var proposalCount = Courses.find({ region: regionId, futureEvents: { $eq: 0 }, lastEvent: { $eq: null } }).count();
	var futureEventCount = Events.find({ region: regionId, start: { $gte: new Date() } }).count();
	var pastEventCount = Events.find({ region: regionId, end: { $lt: new Date() } }).count();

	var coursesWithGroups = Courses.find({ region: regionId, $where: "obj.groups.length > 0" });
	var allGroups = [];
	coursesWithGroups.forEach( function (course) {
		// save all groups (Id) of the course and count their courses
		for(var i = 0; i < course.groups.length; i++){
			var idToCheck = course.groups[i];
			var arrayIndexOfGroup = allGroups.map(function(e) { return e.groupId; })
									.indexOf(idToCheck);

			if( arrayIndexOfGroup == -1) {
				var group = {
					groupId : course.groups[i],
					weight : 1
				}
				allGroups.push(group);
			} else {
				allGroups[arrayIndexOfGroup].weight++;
			}
		}
	});
	for(var i = 0; i < allGroups.length; i++) {
		allGroups[i].name = Groups.findOne({ _id: allGroups[i].groupId }).name;
	}
	allGroups.sort(function(a, b){ return b.weight-a.weight });

	Regions.update(regionId, { $set: {
		courseCount: courseCount,
		proposalCount: proposalCount,
		futureEventCount: futureEventCount,
		pastEventCount: pastEventCount,
		groups: allGroups
	} });
};

Meteor.methods({
	'updateRegionCounters': function(selector) {
		Regions.find(selector).forEach(function(region) {
			updateRegionCounters(region._id);
		});
	}
});
