Template.admin.isAdmin = function () {
	var user = Meteor.user()
	return user && user.isAdmin
};
