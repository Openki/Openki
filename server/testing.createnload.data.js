// TESTING: create new Courses if non in db

createCoursesIfNone = function(){
 if (Courses.find().count() === 0) {
        createCourses();
  }
}


// TESTING: Get user object for name and create it if it doesn't exist
function ensureUser(name) {
	if (!name) {name = 'Serverscriptttt'};
	var user_prototype = {username: name}
	var user
	var age = Math.floor(Random.fraction()*100000000000)
	while (!(user = Meteor.users.findOne(user_prototype))) { // Legit
		var id = Accounts.createUser({
			username: name,
			email: (name+"@schuel.example").toLowerCase(),
			password: name,
			profile: {name : name}
		});
		Meteor.users.update({ _id: id },{$set:{
			createdAt: new Date(new Date().getTime()-age),
			lastLogin: new Date(new Date().getTime()-age/30),
			isAdmin: ['greg', 'FeeLing', 'IvanZ'].indexOf(name) != -1
		}})
		console.log("Mongouser added: "+name)
	}
    return user;
}

// TESTING: Get category object for name and create it if it doesn't exist
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

		// TESTING: allways use same id for same course to avoid broken urls while testing
		var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
		m5.update(course.name);
		m5.update(course.description);
		course._id = m5.digest('hex').substring(0, 8)

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
		course.subscribers_min = Random.fraction() > 0.3 ? undefined : humandistrib()
		course.subscribers_max = Random.fraction() > 0.5 ? undefined : course.subscribers_min + Math.floor(course.subscribers_min*Random.fraction())
		var age = Math.floor(Random.fraction()*80000000000)
		course.time_created = new Date(new Date().getTime()-age)
		course.time_lastedit = new Date(new Date().getTime()-age*0.25)
		course.time_lastenrol = new Date(new Date().getTime()-age*0.15)
		course.region = Random.fraction() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp'
		Courses.insert(course)
		console.log("Mongocourse added: "+course.name)
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
		if (!location.hosts) location.hosts = {}
		location.hosts.contact = [ensureUser(location.hosts.contact)._id]

//		location.maxWorkplaces = Random.fraction() > 0.3 ? undefined : humandistrib()
//		location.maxPeople = Random.fraction() > 0.5 ? undefined : location.subscribers_min + Math.floor(location.maxWorkplaces*Random.fraction())

		var age = Math.floor(Random.fraction()*80000000000)
		location.time_created = new Date(new Date().getTime()-age)
		location.time_lastedit = new Date(new Date().getTime()-age*0.25)
		location.region = Random.fraction() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp'
		Locations.insert(location)
	})
}


createEventsIfNone = function(){
	if (Events.find().count() === 0) {
		var event = {}
		for (var n = 0; n < 35; n++){
		 	var course_count= Courses.find().count()
			var course = Courses.find({},{skip: Math.floor((Math.random()*(course_count-1))), limit: 1}).fetch()
			event.course_id = course[0]._id
			event.title = course[0].name + '-Kurs'
			event.description = 'This is the event-description'
			event.mentors = []
			event.host = []
			var timeToGo = Math.floor(Random.fraction()*5000000000)
			var age = Math.floor(Random.fraction()*10000000000)
			event.startdate = new Date(new Date().getTime()+timeToGo-4000000000)
			event.createdby = 'ServerScript'
			event.time_created = new Date(new Date().getTime()-age)
			event.time_lastedit = new Date(new Date().getTime()-age*0.25)
			Events.insert(event)
		}
	}
}

