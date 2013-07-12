

Meteor.startup(function () {
 createCategoriesIfNone();
 createCoursesIfNone();
});


Meteor.methods({
    insert_userdata: function(username, email, password){
        Accounts.createUser({username:username, email:email, password:password});
    },
    update_userdata: function(username,email) {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                username: username,
                 emails: [{
                    address: email,
                    verified: false
                }]
            }
        });
     },
    update_userpassword: function(new_password) {
        Accounts.setPassword(Meteor.userId(), new_password)
     }
});


// Create Categories if not all anymore

function createCategoriesIfNone() {
	if (Categories.find().count() === 0) {
		_.each(categories, function(category){
			Categories.insert(category)
		})
	}
}

// erstelle neue Kurse, wenns keine in der DB hat

function createCoursesIfNone(){
 if (Courses.find().count() === 0) {
        createCourses();
  }
}


/* TESTING: Get user object for name and create it if it doesn't exist */
function ensureUser(name) {
		var user_prototype = {username: name}
		var user
		while (!(user = Meteor.users.findOne(user_prototype))) { // Legit
			Accounts.createUser({username: name, email: (name+"@schuel.example").toLowerCase(), password: name});
		}
        return user;
}

/* TESTING: Get category object for name and create it if it doesn't exist */
function ensureCategory(name) {
		var category_prototype = {name: name}
		var category
		while (!(category = Categories.findOne(category_prototype))) { // Legit
			Categories.insert(category_prototype)
		}
        return category;
}


function createCourses(){

	/* Make a number that looks like a human chose it, favouring 2 and 5 */
	function humandistrib() {
		var factors = [0,0,0,1,2,2,3,5,5]
		return factors[Math.floor(Random.fraction()*factors.length)] * (Random.fraction() > 0.7 ? humandistrib() : 1) + (Random.fraction() > 0.5 ? humandistrib() : 0)
	}

	_.each(testcourses, function(course) {
		if (!course.createdby) return; // Don't create courses that don't have an creator name

		// allways use same id for same course to avoid broken urls while testing
		var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
		m5.update(course.name);
		m5.update(course.description);
		course._id = m5.digest('hex').substring(0, 8)

/*		for (var i=0; i < course.tags.length; i++) {
			course.tags[i] = ensureCategory(course.tags[i])._id
		} */
		for (var i=0; i < course.categories.length; i++) {
			course.categories[i] = ensureCategory(course.categories[i])._id
		}

		if (course.roles === undefined) course.roles = {}
		_.each(course.roles, function(role) {
			_.each(role.subscribed, function(subscriber, i) {
				role.subscribed[i] = ensureUser(subscriber)._id
			})
		})

		course.createdby = ensureUser(course.createdby)._id
		course.score = Math.floor(Random.fraction()*Random.fraction()*30)
		course.subscribers_min = Random.fraction() > 0.25 ? undefined : humandistrib()
		course.subscribers_max = Random.fraction() > 0.5 ? undefined : course.subscribers_min + Math.floor(course.subscribers_min*Random.fraction())
		course.subscribers = []
		course.time_created = new Date(new Date().getTime()-Math.floor(Random.fraction()*80000000000))
		course.region = Random.fraction() > 0.85 ? '9JyFCoKWkxnf8LWPh' : 'EZqQLGL4PtFCxCNrp'
		Courses.insert(course)
	})
}



