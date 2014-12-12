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
	update_userdata: function(username, email, privacy) {
		var user = Meteor.user();
		
		var changes = {};
		if (user.username !== username) { changes.username = username; }
		if (user.privacy !== privacy) { changes.privacy = !!privacy; }
		if (!user.emails || !user.emails[0] || user.emails[0].address !== email) {
			// Working under the assumption that there is only one address
			// if there was more than one address oops I accidentally your addresses
			if (email && email.length > 3) {
				changes.emails = [{ address: email, verified: false }];
			} else {
				changes.emails = [];
			}
		} 

		if (!_.isEmpty(changes)) {
			Meteor.users.update(Meteor.userId(), {
				$set: changes
			});
		}
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

