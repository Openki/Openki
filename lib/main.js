
Meteor.methods({
     change_subscription: function(courseId, role, add) {
		userId = Meteor.userId()
		course = Courses.findOne({_id: courseId})
		change_subscription(course, role, add)
	}
})

/* Subscribe or unsubscribe user to or from a role in a course */
function change_subscription(course, role, add) {
	if (!Meteor.userId()) {
		// Oops
		if (Meteor.is_client) {
			alert('please log in')
			return;
		} else {
			throw new Meteor.Error(401, "please log in")
		}
	}
	
	if (!course.roles[role]) throw new Meteor.Error(404, "No role "+role)
	var where = 'roles.'+role+'.subscribed'
	var update = {}
	update[where] = Meteor.userId()
	var operation = {}
	operation[add ? '$addToSet' : '$pull'] = update
	Courses.update(course, operation)
// weiterer dB eintrag: letzte anmeldungsänderung:
	var time = new Date
	Courses.update(course, { $set: {time_lastenrol:time}})
}