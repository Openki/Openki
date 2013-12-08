Template.admin.isAdmin = function () {
	var user = Meteor.user()
	console.log(user)
	return user && user.isAdmin
};

