Template.usersCourselist.onCreated(function() {
	var instance = this;

	instance.autorun(function() {
		var id = instance.data.profileData.user._id;
		Meteor.subscribe('coursesFind',  { userInvolved: id });
	});
});

Template.usersCourselist.helpers({
	roles: function() {
		return _.clone(Roles).reverse();
	},

	coursesByRoleCount: function(role) {
		return Courses.find({ members: { $elemMatch: {
			user: Template.instance().data.profileData.user._id,
			roles: role }
		}}).count();
	},

	coursesByRole: function(role) {
		return Courses.find({ members: { $elemMatch: {
			user: Template.instance().data.profileData.user._id,
			roles: role }
		}});
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
