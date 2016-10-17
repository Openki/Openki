Template.usersCourselist.helpers({
	roles: function() {
		return _.clone(Roles).reverse();
	},

	coursesByRole: function(role) {
		var profileData = Template.instance().data.profileData;
		var involvedIn = profileData.involvedIn;
		var userID = profileData.user._id;
		var coursesForRole = [];

		involvedIn.forEach(function(course) {
			if (hasRoleUser(course.members, role, userID)) {
				coursesForRole.push(course);
			}
		});

		return coursesForRole;
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
	}
});
