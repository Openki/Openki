Meteor.methods({
	updateUserLocale: function(locale){
		Meteor.users.update(Meteor.userId(), {
			$set: { 'profile.locale': locale }
		});
	}
});
