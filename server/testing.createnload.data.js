// TESTING: in order to test scalebility
ScaleFaktor = 1

// TESTING: create new Courses if non in db

createCoursesIfNone = function(){
 if (Courses.find().count() === 0) {
        createCourses();
  }
}


// TESTING: Get user object for name and create it if it doesn't exist
function ensureUser(name) {
	if (!name) {name = 'Serverscriptttt'};
	var email = (name.replace(' ', '')+"@schuel.example").toLowerCase()
	
	while (true) {
		var user = Meteor.users.findOne({ "emails.address": email})
		if (user) return user;
		
		user = Meteor.users.findOne({username: name})
		if (user) return user;
		
		console.log("Adding user "+name+' '+email)

		var id = Accounts.createUser({
			username: name,
			email: email,
			password: name,
			profile: {name : name},
		});
		
		var age = Math.floor(Random.fraction()*100000000000)
		Meteor.users.update({ _id: id },{$set:{
			createdAt: new Date(new Date().getTime()-age),
			lastLogin: new Date(new Date().getTime()-age/30),
			isAdmin: ['greg', 'FeeLing', 'IvanZ'].indexOf(name) != -1
		}})
	}
}

function ensureRegion(name) {
	while (true) {
		var region = Regions.findOne({name: name})
		if (region) return region._id;
		
		
		var id = Regions.insert({
			name: name,
			timezone: "UTC+"+Math.floor(Random.fraction()*12)+":00"
		});
		
		console.log("Added region "+name+" "+id)
	}
}

// TESTING: Get category object for name
function categoryForName(name) {
		var category = Categories.findOne({nameDE: name})
		if (!category) throw "No category "+name
        return category;
}


function createCourses(){

	// Make a number that looks like a human chose it, favouring 2 and 5
	function humandistrib() {
		var factors = [0,0,1,2,2,3,5,5]
		return factors[Math.floor(Random.fraction()*factors.length)] * (Random.fraction() > 0.7 ? humandistrib() : 1) + (Random.fraction() > 0.5 ? humandistrib() : 0)
	}


	_.each(testcourses, function(course) {
		if (!course.createdby) return; // Don't create courses that don't have an creator name

		var category_names = course.categories
		course.categories = []
		for (var i=0; category_names && i < category_names.length; i++) {
			var cat = categoryForName(category_names[i])
			course.categories.push(cat._id)
			if (cat.parent) course.categories.push(cat.parent)
		}

		/* Replace user name with ID */
		_.each(course.members, function(member) {
			member.user = ensureUser(member.user)._id
		})
		course.createdby = ensureUser(course.createdby)._id
		var name = course.name
		for (var n = 0; n < ScaleFaktor; n++) {
			course.name = name + (n > 0 ? ' Kopie ' + n : '')
			course.slug = getSlug(name + ' Kopie ' + n)


			// TESTING: allways use same id for same course to avoid broken urls while testing
			var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
			m5.update(course.name);
			m5.update(course.description);
			course._id = m5.digest('hex').substring(0, 8)

			course.subscribers_min = Random.fraction() > 0.3 ? undefined : humandistrib()
			course.subscribers_max = Random.fraction() > 0.5 ? undefined : course.subscribers_min + Math.floor(course.subscribers_min*Random.fraction())
			course.date = Random.fraction() > 0.50 ? new Date(new Date().getTime()+((Random.fraction()-0.25)*8000000000)) : false
			var age = Math.floor(Random.fraction()*80000000000)
			course.time_created = new Date(new Date().getTime()-age)
			course.time_lastedit = new Date(new Date().getTime()-age*0.25)
			course.time_lastenrol = new Date(new Date().getTime()-age*0.15)
			if (course.region) {
				course.region = ensureRegion(course.region)
			} else {
				/* place in random test region, Spilistan or Testistan */
				course.region = Random.fraction() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp'  
			}
			course.groups = _.map(course.groups, ensureGroup)
			var id = Courses.insert(course)
			console.log("Added course "+course.name+" "+id)
		}
	})
}


/////////////////////////////// TESTING: Create Locations if non in db

createLocationsIfNone = function(){
 if (Locations.find().count() === 0) {
        createLocations();
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
function createLocations(){

	_.each(testlocations, function(location) {
		if (!location.name) return; // Don't create locations that don't have a name

		// TESTING: allways use same id for same location to avoid broken urls while testing
		var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
		m5.update(location.name);
//		m5.update(location.description);
		location._id = m5.digest('hex').substring(0, 8)

		var category_names = location.categories
		location.categories = []
		for (var i=0; category_names && i < category_names.length; i++) {
			location.categories.push(ensureLocationCategory(category_names[i]))
		}

		if (location.roles === undefined) location.roles = {}
		_.each(location.roles, function(role) {
			_.each(role.subscribed, function(subscriber, i) {
				role.subscribed[i] = ensureUser(subscriber)._id
			})
		})

		location.createdby = ensureUser(location.createdby)._id
//		location.hosts.noContact = ensureUser(location.hosts.noContact)._id
		if (!location.hosts) location.hosts = []
		location.hosts = [ensureUser(location.hosts[0])._id]

//		location.maxWorkplaces = Random.fraction() > 0.3 ? undefined : humandistrib()
//		location.maxPeople = Random.fraction() > 0.5 ? undefined : location.subscribers_min + Math.floor(location.maxWorkplaces*Random.fraction())

		var age = Math.floor(Random.fraction()*80000000000)
		location.time_created = new Date(new Date().getTime()-age)
		location.time_lastedit = new Date(new Date().getTime()-age*0.25)
		location.region = Random.fraction() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp'
		Locations.insert(location)
	})
}





/////////////////////////////// TESTING: Create Events if non in db

createEventsIfNone = function(){
    //Events.remove({});
	if (Events.find().count() === 0) {
		var event = {}
		for (var n = 0; n < (35*ScaleFaktor); n++){
		 	var course_count= Courses.find().count()
			var course = Courses.find({},{skip: Math.floor((Math.random()*(course_count-1))), limit: 1}).fetch()
			event.course_id = course[0]._id
			event.title = course[0].name + '-Kurs'
			event.description = 'This is the event-description'
			event.mentors = []
			event.host = []
			var spread = 1000*60*60*24*365*1.2					// cause it's millis  1.2 Jears
			var timeToGo = Random.fraction()-0.8 				// put 80% in the past
			if (timeToGo >= 0.05) {								// 75% of the remaining in future
				timeToGo = Math.pow((timeToGo-0.05)*5, 2)		// exponetial. in order to decrease occurrence in time
			}
			timeToGo = Math.floor(timeToGo*spread)
			event.startdate = new Date(new Date().getTime()+timeToGo)

		/*  														TODO: ???
			if (course[0].roles.indexOf(mentor) != -1) {
				event.mentors = ['Serverscript']
			}
			if (hasRole (course[0], host)){
				course[0].members.   // function not jet here!
			}
			else event.host = ['Serverscript']
		*/
			event.createdby = 'ServerScript'
			var age = Math.floor(Random.fraction()*10000000000)
			event.time_created = new Date(new Date().getTime()-age)
			event.time_lastedit = new Date(new Date().getTime()-age*0.25)
			Events.insert(event)
		}
	}
}

createGroupsIfNone = function(){
    //Events.remove({});
	if (Groups.find().count() === 0) {
		_.each (testgroups, function (group){
			group.createdby = 'ServerScript'
			var age = Math.floor(Random.fraction()*10000000000)
			group.time_created = new Date(new Date().getTime()-age)
			group.time_lastedit = new Date(new Date().getTime()-age*0.25)
				// TESTING: allways use same id for same group to avoid broken urls while testing
			var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
			m5.update(group.name);
			m5.update(group.description);
			group._id = m5.digest('hex').substring(0, 8)

			var members = group.members
			delete group.members
			Groups.insert(group)
			console.log("Adding group "+group.name)

			_.each (members, function (name){
				var member = ensureUser(name)
				Meteor.users.update(member._id, {$push:{'groups':group._id}})
			})
		})
	}
}
function ensureGroup(name) {
	while (true) {
		var group = Groups.findOne({name: name})
		if (group) return group._id;
		
		var id = Groups.insert({
			name: name,
			createdby: 'ServerScript_from_TestCouses',
			description: 'Automaticaly created group by server'
		});
		console.log("Added group from TestCouses "+name+" "+id)
	}
}


/////////////////////////////// TESTING: Create Regions if non in db

createTestRegionsIfNone = function(){
	if (Meteor.isServer && Regions.find().count() == 0) {
		_.each(regions, function(region){
			Regions.insert(region)
		})
	}
}
