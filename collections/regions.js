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
	var allGroups = new Map();
	var groups = [];
	var allUsers = new Map();
	var mentorCount = 0;

	coursesWithGroups.forEach( function (course) {
		// save all groups (Id) of the course and count their courses
		for(var i = 0; i < course.groups.length; i++){
			var idToCheck = course.groups[i];
			var weight = allGroups.get(idToCheck);
			if(weight != undefined) {
				weight++;
			} else {
				weight = 1;
			}
			allGroups.set(idToCheck, weight);
		}
		// save all distinguished users an if they are a "mentor" somewhere
		for(var i = 0; i < course.members.length; i++){
			var member = course.members[i];
			var userRole = allUsers.get(member.user);
			if(userRole == undefined){
				userRole = member.roles[0];
				allUsers.set(member.user, userRole);
				if (userRole == "mentor") mentorCount++;
			}
			if (userRole != "mentor") {
				for(var j = 0; j < member.roles.length; j++){
					if(member.roles[j] == "mentor"){
						allUsers.set(member.user, "mentor");
						mentorCount++;
						j = member.roles.length; // quit for-loop
					}
				}
			}
		}
	});
	allGroups.forEach( function (value, key){
		var group = {
		id : key,
		weight : value,
		name : Groups.findOne({ _id: key }).name

		}
		groups.push(group);
	});
	groups.sort(function(a, b){ return b.weight-a.weight });

	Regions.update(regionId, { $set: {
		courseCount: courseCount,
		proposalCount: proposalCount,
		futureEventCount: futureEventCount,
		pastEventCount: pastEventCount,
		groups: groups,
		userCount: allUsers.size,
		mentorCount: mentorCount
	} });
};

Meteor.methods({
	'updateRegionCounters': function(selector) {
		Regions.find(selector).forEach(function(region) {
			updateRegionCounters(region._id);
		});
	}
});
