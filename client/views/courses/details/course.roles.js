Template.coursedetails.helpers({
		
	roleDetails: function() {
		var course = this
		return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
			var role = roletype.type
			if (course.roles.indexOf(role) !== -1) {
				goodroles.push({
					roletype: roletype,
					role: role,
					subscribed: hasRoleUser(course.members, role, Meteor.userId()),
					course: course
				})
			}
			return goodroles;
		}, []);
	}
})