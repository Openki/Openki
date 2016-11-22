// TESTING: Get user object for name and create it if it doesn't exist

// Select a date that is after the given date
// For past dates a date between the original date and the present is chosen,
// dates closer to the original date preferred.
// For future dates, a date between the original date and double the time between now and then is chosen.
var sometimesAfter = function(date) {
	var prng = Prng("sometimesAfter");

	// Seconds between then and now
	var spread = new Date(Math.abs(new Date().getTime() - date.getTime()));

	// Quadratic dropoff: Place new date closer to the original date statistically
	var placement = prng();
	var squaredPlacement = placement * placement;

	return new Date(date.getTime() + spread * squaredPlacement);
};

function ensureUser(name) {
	var prng = Prng("ensureUser");

	if (!name) {name = 'Serverscriptttt';}
	var email = (name.replace(' ', '')+"@openki.example").toLowerCase();

	while (true) {
		var user = Meteor.users.findOne({ "emails.address": email});
		if (user) return user;

		user = Meteor.users.findOne({username: name});
		if (user) return user;

		var id = Accounts.createUser({
			username: name,
			email: email,
			profile: {name : name},
		});

		var age = Math.floor(prng()*100000000000);
		Meteor.users.update({ _id: id },{$set:{
			services : {"password" : {"bcrypt" : "$2a$10$pMiVQDN4hfJNUk6ToyFXQugg2vJnsMTd0c.E0hrRoqYqnq70mi4Jq"}},  //every password is set to "greg". cause creating passwords takes too long
			createdAt: new Date(new Date().getTime()-age),
			lastLogin: new Date(new Date().getTime()-age/30)
		}});

		console.log("   Added user: "+name);

	}
}

function ensureRegion(name) {
	var prng = Prng("ensureRegion");

	while (true) {
		var region = Regions.findOne({name: name});
		if (region) return region._id;


		var id = Regions.insert({
			name: name,
			timezone: "UTC+"+Math.floor(prng()*12)+":00"
		});

		console.log("Added region: "+name+" "+id);
	}
}

function ensureVenue(name, regionId) {
	var prng = Prng("ensureLocation");

	while (true) {
		var venue = Venues.findOne({name: name, region:regionId});

		if (venue) return venue;

		venue = {
			name: name,
			region: regionId,
			rooms: []
		};

		var region = Regions.findOne(regionId);
		var lat = region.loc.coordinates[1] + Math.pow(prng(), 2) * 0.02 * (prng() > 0.5 ? 1 : -1);
		var lon = region.loc.coordinates[0] + Math.pow(prng(), 2) * 0.02 * (prng() > 0.5 ? 1 : -1);
		venue.loc =  {"type": "Point", "coordinates":[lon, lat]};

		// TESTING: always use same id for same location to avoid broken urls while testing
		var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
		m5.update(venue.name);
		m5.update(venue.region);

		venue._id = m5.digest('hex').substring(0, 8);

		var age = Math.floor(prng()*80000000000);
		venue.time_created = new Date(new Date().getTime()-age);
		venue.time_lastedit = new Date(new Date().getTime()-age*0.25);


		Venues.insert(venue);
		console.log('Added venue: "' + venue.name + '" in region: ' + venue.region);
	}
}

function ensureRoom(venue, room){
	Venues.update(venue._id, { $addToSet: { rooms: room } });
}

function ensureGroup(short) {
	while (true) {
		var group = Groups.findOne({short: short});
		if (group) return group._id;

		var id = Groups.insert({
			name: short,
			short: short,
			members: [],
			createdby: 'ServerScript_from_TestCouses',
			description: 'Automaticaly created group by server'
		});
		console.log("Added group from TestCouses: "+short+" id: "+id);
	}
}


function createCourses(scale) {
	var prng = Prng("createCourses");

	// Make a number that looks like a human chose it, favouring 2 and 5
	function humandistrib() {
		var factors = [0,0,1,2,2,3,5,5];
		return factors[Math.floor(prng()*factors.length)] * (prng() > 0.7 ? humandistrib() : 1) + (prng() > 0.5 ? humandistrib() : 0);
	}


	_.each(testCourses, function(course) {
		if (!course.createdby) return; // Don't create courses that don't have a creator name

		/* Replace user name with ID */
		_.each(course.members, function(member) {
			member.user = ensureUser(member.user)._id;
		});
		course.createdby = ensureUser(course.createdby)._id;
		var name = course.name;
		for (var n = 0; n < scale; n++) {
			course.name = name + (n > 0 ? ' (' + n + ')' : '');
			course.slug = getSlug(name + ' (' + n + ')');
			course.internal = !!course.internal;

			// TESTING: always use same id for same course to avoid broken urls while testing
			var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
			m5.update(course.name);
			m5.update(course.description);
			course._id = m5.digest('hex').substring(0, 8);

			//course.subscribers_min = prng() > 0.3 ? undefined : humandistrib()
			//course.subscribers_max = prng() > 0.5 ? undefined : course.subscribers_min + Math.floor(course.subscribers_min*prng())
			course.date = prng() > 0.50 ? new Date(new Date().getTime()+((prng()-0.25)*8000000000)) : false;
			var age = Math.floor(prng()*80000000000);
			course.time_created = new Date(new Date().getTime()-age);
			course.time_lastedit = new Date(new Date().getTime()-age*0.25);
			course.time_lastenrol = new Date(new Date().getTime()-age*0.15);
			if (course.region) {
				course.region = ensureRegion(course.region);
			} else {
				/* place in random test region, Spilistan or Testistan */
				course.region = prng() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp';
			}
			course.groups = _.map(course.groups, ensureGroup);
			course.groupOrganizers = [];
			Courses.insert(course);
			console.log("Added course: "+course.name);
		}
	});
}

loadCoursesIfNone = function(scale) {
	if (Courses.find().count() === 0) {
		createCourses(scale);
	}
};





/////////////////////////////// TESTING: Create Locations if non in db

function loadVenues(){
	var prng = Prng("loadLocations");

	var testRegions = [Regions.findOne('9JyFCoKWkxnf8LWPh'), Regions.findOne('EZqQLGL4PtFCxCNrp')];
	_.each(testVenues, function(venueData) {
		if (!venueData.name) return;      // Don't create locations that don't have a name

		venueData.region = prng() > 0.85 ? testRegions[0] : testRegions[1];

		var venue = ensureVenue(venueData.name, venueData.region._id);

		_.extend(venue, venueData);

		venue.createdby = ensureUser(venue.createdby)._id;

		Venues.update(venue._id, venue);
	});
}

loadVenuesIfNone = function(){
	if (Venues.find().count() === 0) {
		loadVenues();
	}
};





/////////////////////////////// TESTING: Create generic events if not in db

createEventsIfNone = function(){
	var prng = Prng("createEventsIfNone");

	//Events.remove({});
	if (Events.find().count() === 0) {
		Courses.find().forEach(function(course) {
			var event_count =  Math.floor(Math.pow(prng() * 1.6, 10));
			for (var n = 0; n < event_count; n++) {
				var event = {};
				var description = course.description;
				if (!description) description = "No description"; // :-(
				var words = _.shuffle(description.split(' '));
				event.region = course.region;
				event.groups = course.groups;
				event.groupOrganizers = [];

				var random = prng();
				var venue;
				if (random < 0.4) venue = random < 0.3 ? 'Haus am See' : 'Kongresszentrum';
				else if (random < 0.7) venue = random < 0.5 ? 'Volkshaus' : 'SQ131';
				else if (random < 0.8) venue = random < 0.75 ? 'Caffee Zähringer' : 'Restaurant Krone';
				else if (random < 0.9) venue = random < 0.85 ? 'Hischengraben 3' : 'SQ125';
				else venue = random < 0.95 ? 'Hub' : 'ASZ';
				event.venue = ensureVenue(venue, event.region);

				var rooms;
				if (event.venue.rooms.length > 0) {
					rooms = event.venue.rooms;
					if (prng() > 0.5) event.room = rooms[Math.floor(prng()*rooms.length)];
				}

				if (!event.room && prng() > 0.6) {
					rooms = ['Grosser Saal', 'Vortragsraum', 'Erkerzimmer', 'Mirror-room', 'Garden', '5', 'Moscow', 'Moscow'];
					event.room = rooms[Math.floor(prng()*rooms.length)];
					ensureRoom(event.venue, event.room);
				}

				event.internal = prng() < 0.07;

				event.courseId = course._id;
				event.title = course.name + ' ' + _.sample(words);
				event.description =  words.slice(0, 10 + Math.floor(prng() * 30)).join(' ');
				event.groups = course.groups;
				event.mentors = [];
				event.host = [];

				var spread = 1000*60*60*24*365*1.24;              // cause it's millis  1.2 Years
				var timeToGo = prng()-0.7;             // put 70% in the past
				if (timeToGo >= 0.05) {                           // 75% of the remaining in future
					timeToGo = Math.pow((timeToGo-0.05)*5, 2);     // exponential function in order to decrease occurrence in time
				}
				timeToGo = Math.floor(timeToGo*spread);
				var date = new Date(new Date().getTime() + timeToGo);
				var hour = date.getHours();
				if (prng() > 0.2 && hour < 8 || hour > 21) date.setHours(hour + 12);
				if (prng() > 0.05) date.setMinutes(Math.floor((date.getMinutes()) / 15) * 15); // quarter-hours' precision
				event.start = date;
				event.end = new Date(date.getTime() + (1000*60*60*2));

				var members = course.members;
				var randomMember = members[Math.floor(Math.random()*members.length)];
				event.createdby = ensureUser(randomMember && randomMember.user || 'Serverscript')._id;
				var age = Math.floor(prng() * 10000000000);
				event.time_created = new Date(new Date().getTime() - age);
				event.time_lastedit = new Date(new Date().getTime() - age * 0.25);
				Events.insert(event);
				console.log('Added generic event ('+ n +'/' + event_count +'):  "' + event.title + '"');
			}
		});
	}
};

/////////////////////////////// TESTING: Create generic comments if non in db


createCommentsIfNone = function(){
	var prng = Prng("createCommentsIfNone");

	//Events.remove({});
	if (CourseDiscussions.find().count() === 0) {
		var userCount = Meteor.users.find().count();
		Courses.find().forEach(function(course) {
			var comment_count =  Math.floor(Math.pow(prng() * 2, 4));
			var courseMembers = course.members.length;
			for (var n = 0; n < comment_count; n++) {
				var comment = {};
				var description = course.description;
				if (!description) description = "No description"; // :-(
				var words = _.shuffle(description.split(' '));

				comment.courseId = course._id;
				comment.title = _.sample(words) + ' ' + _.sample(words) + ' ' + _.sample(words);
				comment.text =  words.slice(0, 10 + Math.floor(prng() * 30)).join(' ');

				comment.time_created = sometimesAfter(course.time_created);
				comment.time_updated = (prng() < 0.9) ? comment.time_created : sometimesAfter(comment.time_created);

				var pickMember = course.members[Math.floor(prng()*courseMembers)];
				var commenter = false;
				if (!pickMember || prng() < 0.2 ){
					commenter = Meteor.users.findOne({}, {skip: Math.floor(prng()*userCount)})._id;
				} else {
					commenter = pickMember.user;
				}
				comment.userId = commenter;
				CourseDiscussions.insert(comment);
			}
			if (comment_count > 0) {
				console.log('Added '+ comment_count +' generic comments for ' + course.name);
			}
		});
	}
};


/////////////////////////////// TESTING: load the events from file server/data/testing.events.js
/////////////////////////////// most of these don't have a parent course


loadTestEvents = function(){
	var dateOffset = 0;
	_.each(testEvents, function(event) {
		if (!event.createdBy) return; // Don't create events that don't have a creator name
		if (Events.findOne({_id: event._id})) return; //Don't create events that exist already

		event.createdBy = ensureUser(event.createdby)._id;  // Replace user name with ID
		event.groups = _.map(event.groups, ensureGroup);
		event.groupOrganizers = [];

		/* Create the events around the current Day.
		First loaded event gets moved to current day. All events stay at original hour */
		if (dateOffset === 0){
			var toDay = new Date();
			toDay.setHours(0); toDay.setMinutes(0); toDay.setSeconds(0);
			var DayOfFirstEvent = new Date(event.start.$date);
			DayOfFirstEvent.setHours(0); DayOfFirstEvent.setMinutes(0); DayOfFirstEvent.setSeconds(0);
			dateOffset = toDay.getTime()-DayOfFirstEvent.getTime();
			console.log("   Loading events, Date Offset is: "+moment.duration(dateOffset).humanize());
			console.log("   which is "+dateOffset+" milliseconds, right?");
			console.log("   becouse toDay is: "+toDay+", and day of first loaded event is: "+DayOfFirstEvent);
		}
		event.venue = ensureVenue(event.venue, event.region);
		if (event.room) {
			ensureRoom(event.venue, event.room);
		}
		event.internal = !!event.internal;
		event.start = new Date(event.start.$date+dateOffset);
		event.end = new Date(event.end.$date+dateOffset);
		event.time_created = new Date(event.time_created.$date);
		event.time_lastedit = new Date(event.time_lastedit.$date);
		Events.insert(event);
		console.log("Loaded event:  "+event.title);
	});
};






loadGroupsIfNone = function(){
	var prng = Prng("loadGroupsIfNone");

	if (Groups.find().count() === 0) {
		_.each (testGroups, function (group){
			if (!group.name) return;
			group.createdby = 'ServerScript_loadingTestgroups';
			var age = Math.floor(prng()*10000000000);
			group.time_created = new Date(new Date().getTime()-age);
			group.time_lastedit = new Date(new Date().getTime()-age*0.25);
				// TESTING: always use same id for same group to avoid broken urls while testing
			var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
			m5.update(group.name);
			m5.update(group.description);
			group._id = m5.digest('hex').substring(0, 8);
			group.members = _.map(group.members, function (name){
				return ensureUser(name)._id;
			});
			Groups.insert(group);
			console.log("Added Testgroup:   "+group.name);
		});
	}
};

/////////////////////////////// TESTING: Create Regions if non in db

loadTestRegionsIfNone = function(){
	if (Meteor.isServer && Regions.find().count() === 0) {
		_.each(regions, function(region){
			if (region.loc) {
				region.loc = region.loc.reverse();			//latitude first !!?!
				region.loc = { "type": "Point", "coordinates": region.loc }; //2dsphere
			}
			Regions.insert(region);
			console.log('*Added region: '+region.name);
		});
	}
};
