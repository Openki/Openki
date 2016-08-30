UpdatesAvailable.removeRoles = function() {
	var Roles = new Meteor.Collection("Roles");
	var count = Roles.find().count();
	Roles.rawCollection().drop();
	return count;
};