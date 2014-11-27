

Meteor.startup(function () {
	createCategoriesIfNone();
	createCoursesIfNone();         // TESTING...
	createLocationsIfNone();       // TESTING...
	createEventsIfNone();          // TESTING...
});


Meteor.methods({
	insert_userdata: function(username, email, password){
		Accounts.createUser({username:username, email:email, password:password});
	},
	update_userdata: function(username,email,privacy) {
		Meteor.users.update(Meteor.userId(), {
			$set: {
				username: username,
				emails: [{
					address: email,
					verified: false
				}],
				privacy: privacy == true
			}
		});
	},
	update_userpassword: function(new_password) {
		Accounts.setPassword(Meteor.userId(), new_password)
	},
	insert_anonId: function(anonId){
		Meteor.users.update(Meteor.userId(), {
			$push: {
				anonId: anonId
			}
		});
	}
});


// SETUP: Create Categories if not all anymore

function createCategoriesIfNone() {
	if (Categories.find().count() === 0) {
		_.each(categories, function(category){
			Categories.insert(category)
		})
	}
}

