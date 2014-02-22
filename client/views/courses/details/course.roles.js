Template.roleDetails.helpers({

	roleDetails: function() {
		var course = this
		return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
			var role = roletype.type
			var sub = hasRoleUser(course.members, role, Meteor.userId())
			if (course.roles.indexOf(role) !== -1) {
				goodroles.push({
					roletype: roletype,
					role: role,
					subscribed: !!sub,
					anonsub: sub == 'anon',
					course: course
				})
			}
			return goodroles;
		}, []);
	}
})