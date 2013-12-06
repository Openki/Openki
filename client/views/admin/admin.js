Template.admin.isAdmin = function () {
	if (this._id === Meteor.userId()){
		return("isAdmin", true);
	}
	else {
		return("isAdmin", false);
	}
};