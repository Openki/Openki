// TESTING: Get user object for name and create it if it doesn't exist
function ensureUser(name) {
	if (!name) {name = 'Serverscriptttt'};
	var email = (name.replace(' ', '')+"@openki.example").toLowerCase()
	
	while (true) {
		var user = Meteor.users.findOne({ "emails.address": email})
		if (user) return user;
		
		user = Meteor.users.findOne({username: name})
		if (user) return user;

		var id = Accounts.createUser({
			username: name,
			email: email,
			profile: {name : name},
		});
		
		var age = Math.floor(Math.random()*100000000000)
		Meteor.users.update({ _id: id },{$set:{
			services : {"password" : {"bcrypt" : "$2a$10$pMiVQDN4hfJNUk6ToyFXQugg2vJnsMTd0c.E0hrRoqYqnq70mi4Jq"}},  //every password is set to "greg". cause creating passwords takes too long
			createdAt: new Date(new Date().getTime()-age),
			lastLogin: new Date(new Date().getTime()-age/30)
		}});

		console.log("   Added user: "+name)

	}
}

function ensureRegion(name) {
	while (true) {
		var region = Regions.findOne({name: name})
		if (region) return region._id;
		
		
		var id = Regions.insert({
			name: name,
			timezone: "UTC+"+Math.floor(Math.random()*12)+":00"
		});
		
		console.log("Added region: "+name+" "+id)
	}
}

function ensureLocation(name, regionId) {
	while (true) {
		var location = Locations.findOne({name: name, region:regionId})

		if (location) return location;

		location = {
			name: name,
			region: regionId,
		};

		var region = Regions.findOne(regionId);
		var lat = region.loc.coordinates[1] + Math.pow(Math.random(), 2) * .02 * (Math.random() > .5 ? 1 : -1);
		var lon = region.loc.coordinates[0] + Math.pow(Math.random(), 2) * .02 * (Math.random() > .5 ? 1 : -1);
		location.loc =  {"type": "Point", "coordinates":[lon, lat]};

		// TESTING: always use same id for same location to avoid broken urls while testing
		var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
		m5.update(location.name);
		m5.update(location.region);

		location._id = m5.digest('hex').substring(0, 8);

		var age = Math.floor(Math.random()*80000000000)
		location.time_created = new Date(new Date().getTime()-age)
		location.time_lastedit = new Date(new Date().getTime()-age*0.25)



		Locations.insert(location);
		console.log('Added location: "'+location.name+'" in region: '+location.region);
	}
}

function ensureRoom(location, room){
	Locations.update(location, { $addToSet: { rooms: room } });
}

loadCoursesIfNone = function(scale) {
	if (Courses.find().count() === 0) {
		createCourses(scale);
	}
}

function createCourses(scale) {

	// Make a number that looks like a human chose it, favouring 2 and 5
	function humandistrib() {
		var factors = [0,0,1,2,2,3,5,5]
		return factors[Math.floor(Math.random()*factors.length)] * (Math.random() > 0.7 ? humandistrib() : 1) + (Math.random() > 0.5 ? humandistrib() : 0)
	}


	_.each(testcourses, function(course) {
		if (!course.createdby) return; // Don't create courses that don't have a creator name

		/* Replace user name with ID */
		_.each(course.members, function(member) {
			member.user = ensureUser(member.user)._id
		})
		course.createdby = ensureUser(course.createdby)._id
		var name = course.name
		for (var n = 0; n < scale; n++) {
			course.name = name + (n > 0 ? ' (' + n + ')' : '');
			course.slug = getSlug(name + ' (' + n + ')');


			// TESTING: always use same id for same course to avoid broken urls while testing
			var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
			m5.update(course.name);
			m5.update(course.description);
			course._id = m5.digest('hex').substring(0, 8)

			//course.subscribers_min = Math.random() > 0.3 ? undefined : humandistrib()
			//course.subscribers_max = Math.random() > 0.5 ? undefined : course.subscribers_min + Math.floor(course.subscribers_min*Math.random())
			course.date = Math.random() > 0.50 ? new Date(new Date().getTime()+((Math.random()-0.25)*8000000000)) : false
			var age = Math.floor(Math.random()*80000000000)
			course.time_created = new Date(new Date().getTime()-age)
			course.time_lastedit = new Date(new Date().getTime()-age*0.25)
			course.time_lastenrol = new Date(new Date().getTime()-age*0.15)
			if (course.region) {
				course.region = ensureRegion(course.region)
			} else {
				/* place in random test region, Spilistan or Testistan */
				course.region = Math.random() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp'
			}
			course.groups = _.map(course.groups, ensureGroup)
			var id = Courses.insert(course)
			console.log("Added course: "+course.name)
		}
	})
}




/////////////////////////////// TESTING: Create Locations if non in db

loadLocationsIfNone = function(){
 	if (Locations.find().count() === 0) {
		loadLocations();
	}
}

function ensureLocationCategory(name){
	var category_prototype = {name: name}
	var category
	while (!(category = LocationCategories.findOne(category_prototype))) { // Legit
		LocationCategories.insert(category_prototype)
	}
	return category
}

// TESTING:
function loadLocations(){

	var testRegions = [Regions.findOne('9JyFCoKWkxnf8LWPh'), Regions.findOne('EZqQLGL4PtFCxCNrp')]
	_.each(testLocations, function(locationData) {
		if (!locationData.name) return;      // Don't create locations that don't have a name

		locationData.region = Math.random() > 0.85 ? testRegions[0] : testRegions[1];

		var location = ensureLocation(locationData.name, locationData.region._id);

		_.extend(location, locationData);

		var category_names = location.categories
		location.categories = []
		for (var i=0; category_names && i < category_names.length; i++) {
			location.categories.push(ensureLocationCategory(category_names[i]))
		}

		location.createdby = ensureUser(location.createdby)._id;
//		location.hosts.noContact = ensureUser(location.hosts.noContact)._id

//		if (!location.hosts) location.hosts = [];
//		location.hosts = [ensureUser(location.hosts[0])._id];

//		location.maxWorkplaces = Math.random() > 0.3 ? undefined : humandistrib()
//		location.maxPeople = Math.random() > 0.5 ? undefined : location.subscribers_min + Math.floor(location.maxWorkplaces*Math.random())

		Locations.update(location._id, location);
	});
}





/////////////////////////////// TESTING: Create generic events if not in db

createEventsIfNone = function(){
	//Events.remove({});
	if (Events.find().count() === 0) {
		Courses.find().forEach(function(course) {
			var event_count =  Math.floor(Math.pow(Math.random() * 1.6, 10));
			for (var n = 0; n < event_count; n++) {
				var event = {};
				var description = course.description;
				if (!description) description = "No description"; // :-(
				var words = _.shuffle(description.split(' '));
				event.region = course.region;
				var random = Math.random();

				var location;
				if (random < 0.4 && random > 0.1) location = random < 0.2 ? 'Haus am See' : 'Kongresszentrum';
				else if (random < 0.7) location = random < 0.5 ? 'Volkshaus' : 'SQ131';
				else if (random < 0.8) location = random < 0.75 ? 'Caffee Zähringer' : 'Restaurant Krone';
				else if (random < 0.9) location = random < 0.85 ? 'Hischengraben 3' : 'SQ125';
				else location = random < 0.95 ? 'Hub' : 'ASZ';
				event.location = { _id: ensureLocation(location, event.region)._id };
				event.course_id = course._id;
				event.title = course.name + ' ' + _.sample(words);
				event.description =  words.slice(0, 10 + Math.floor(Math.random() * 30)).join(' ');
				event.groups = course.groups;
				event.mentors = [];
				event.host = [];

				var spread = 1000*60*60*24*365*1.24;              // cause it's millis  1.2 Years
				var timeToGo = Math.random()-0.7;             // put 70% in the past
				if (timeToGo >= 0.05) {                           // 75% of the remaining in future
					timeToGo = Math.pow((timeToGo-0.05)*5, 2)     // exponential function in order to decrease occurrence in time
				}
				timeToGo = Math.floor(timeToGo*spread);
				var date = new Date(new Date().getTime() + timeToGo);
				var hour = date.getHours();
				if (Math.random() > 0.2 && hour < 8 || hour > 21) date.setHours(hour + 12);
				if (Math.random() > 0.05) date.setMinutes(Math.floor((date.getMinutes()) / 15) * 15); // quarter-hours' precision
				event.start = date;
				event.end = new Date(date.getTime() + (1000*60*60*2));
				event.createdby = 'ServerScript'
				var age = Math.floor(Math.random() * 10000000000)
				event.time_created = new Date(new Date().getTime() - age)
				event.time_lastedit = new Date(new Date().getTime() - age * 0.25)
				Events.insert(event)
				console.log('Added generic event ('+ n +'/' + event_count +'):  "' + event.title + '"');
			}
		});
	}
}

/////////////////////////////// TESTING: Create generic comments if non in db


createCommentsIfNone = function(){
	//Events.remove({});
	if (CourseDiscussions.find().count() === 0) {
		var userCount = Meteor.users.find().count();
		Courses.find().forEach(function(course) {
			var comment_count =  Math.floor(Math.pow(Math.random() * 2, 4));
			var courseMembers = course.members.length;
			for (var n = 0; n < comment_count; n++) {
				var comment = {};
				var description = course.description;
				if (!description) description = "No description"; // :-(
				var words = _.shuffle(description.split(' '));
				var random = Math.random();

				comment.course_ID = course._id;
				comment.title = _.sample(words) + ' ' + _.sample(words) + ' ' + _.sample(words);
				comment.text =  words.slice(0, 10 + Math.floor(Math.random() * 30)).join(' ');

				var spread = new Date(new Date().getTime() - course.time_created)
				var age = Math.random()
				age = Math.floor(age*spread);
				var date = new Date(new Date().getTime() - age);
				comment.time_created = date;
				comment.time_updated = date + age * 0.77;
				
				var pickMember = course.members[Math.floor(Math.random()*courseMembers)];
				var commentor = false;
				if (!pickMember || Math.random() < 0.2 ){
					commenter = Meteor.users.findOne({}, {skip: Math.floor(Math.random()*userCount)})._id
				} else {
					commenter = pickMember.user;
				}
				comment.user_ID = commenter
				CourseDiscussions.insert(comment)
				console.log('Added '+ (n+1) +' of '+ comment_count +' generic comments:  "' + comment.title + '"');
			}
		});
	}
}


/////////////////////////////// TESTING: load the events from file server/data/testing.events.js
/////////////////////////////// most of these don't have a parent course


loadTestEvents = function(){
	var dateOffset = 0
	_.each(testevents, function(event) {
		if (!event.createdBy) return; // Don't create events that don't have a creator name
		if (Events.findOne({_id: event._id})) return; //Don't create events that exist already
		
		event.createdBy = ensureUser(event.createdby)._id;  // Replace user name with ID
		event.groups = _.map(event.groups, ensureGroup);

		/* Create the events around the current Day. 
		First loaded event gets moved to current day. All events stay at original hour */
		if (dateOffset == 0){
			var toDay = new Date();
			toDay.setHours(0); toDay.setMinutes(0); toDay.setSeconds(0);
			var DayOfFirstEvent = new Date(event.start.$date)
			DayOfFirstEvent.setHours(0); DayOfFirstEvent.setMinutes(0); DayOfFirstEvent.setSeconds(0);
			dateOffset = toDay.getTime()-DayOfFirstEvent.getTime()
			console.log("   Loading events, Date Offset is: "+moment.duration(dateOffset).humanize());
			console.log("   which is "+dateOffset+" milliseconds, right?");
			console.log("   becouse toDay is: "+toDay+", and day of first loaded event is: "+DayOfFirstEvent);
		}
		event.location = { _id: ensureLocation(event.location, event.region)._id };
		delete event.location;
		if (event.room) ensureRoom (event.location, event.room);
		event.start = new Date(event.start.$date+dateOffset);
		event.end = new Date(event.end.$date+dateOffset);
		event.time_created = new Date(event.time_created.$date);
		event.time_lastedit = new Date(event.time_lastedit.$date);
		var id = Events.insert(event);
		console.log("Loaded event:  "+event.title);
	})
}






loadGroupsIfNone = function(){
	if (Groups.find().count() === 0) {
		_.each (testgroups, function (group){
			if (!group.name) return;
			group.createdby = 'ServerScript_loadingTestgroups'
			var age = Math.floor(Math.random()*10000000000)
			group.time_created = new Date(new Date().getTime()-age)
			group.time_lastedit = new Date(new Date().getTime()-age*0.25)
				// TESTING: always use same id for same group to avoid broken urls while testing
			var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
			m5.update(group.name);
			m5.update(group.description);
			group._id = m5.digest('hex').substring(0, 8)
			group.members = _.map(group.members, function (name){
				return ensureUser(name)._id
			});
			Groups.insert(group)
			console.log("Added Testgroup:   "+group.name)
		})
	}
}

function ensureGroup(short) {
	while (true) {
		var group = Groups.findOne({short: short})
		if (group) return group._id;
		
		var id = Groups.insert({
			name: short,
			short: short,
			createdby: 'ServerScript_from_TestCouses',
			description: 'Automaticaly created group by server'
		});
		console.log("Added group from TestCouses: "+name+"    id: "+id)
	}
}


/////////////////////////////// TESTING: Create Regions if non in db

loadTestRegionsIfNone = function(){
	if (Meteor.isServer && Regions.find().count() == 0) {
		_.each(regions, function(region){
			if (region.loc) {
				region.loc = region.loc.reverse()			//latitude first !!?!
				region.loc = { "type": "Point", "coordinates": region.loc } //2dsphere
			}
			Regions.insert(region)
			console.log('*Added region: '+region.name)
		})
	}
}
