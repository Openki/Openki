const UpdatesAvailable = [];

// eslint-disable-next-line func-names
UpdatesAvailable.removeRoles = function () {
	const Roles = new Meteor.Collection('Roles');
	const count = Roles.find().count();
	Roles.rawCollection().drop();
	return count;
};
