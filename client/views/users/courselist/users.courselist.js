Template.usersCourselist.onCreated(function() {
	var instance = this;

	var id = instance.data.profileData.user._id;

	instance.subscribe('coursesFind',  { userInvolved: id });

	instance.coursesByRole = function(role) {
		return Courses.find({ members: { $elemMatch: {
			user: id,
			roles: role }
		}});
	};
});

Template.usersCourselist.helpers({
	roles: function() {
		return _.clone(Roles).reverse();
	},

	coursesByRoleCount: function(role) {
		return Template.instance().coursesByRole(role).count();
	},

	coursesByRole: function(role) {
		return Template.instance().coursesByRole(role);
	},

	roleUserList: function() {
		return 'roles.' + this.type + '.userList';
	},

	roleMyList: function() {
		return 'roles.' + this.type + '.myList';
	},

	getName: function() {
		var username = Template.instance()
		               .data.profileData
		               .user.username;
		if (username) return username;
	},
	roleShort: function() {
		return 'roles.' + this.type + '.short';
	}
});
