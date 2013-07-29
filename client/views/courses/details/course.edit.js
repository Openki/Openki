//versuch:

Template.course_edit.query = function() {
	return Session.get('search')
}


Template.course_edit.available_categories = function(parent) {
	if (parent)return Categories.find({parent: parent})
	return Categories.find({parent: {$lt:1}})   //only shows cats with parents undefined
}
Template.course_edit.available_subcategories = function() {
	return Categories.find({parent: {$lt:1}})   //only shows cats with parents undefined
}

Template.course_edit.available_roles = function() {
	return Roles.find({'preset': { $ne: true }})
}

/* Emit 'checked' string if id shows up as member or property of cats */
Template.course_edit.checked = function(id, cats) {
	if (cats === undefined) return;
	if (cats.length) {
		return cats.indexOf(id) >= 0 ? 'checked' : ''
	} else {
		return (id in cats) ? 'checked' : ''
	}
}

// to be put on server ...........

Template.course_edit.events({
	'click input.save': function () {
		var course = this._id ? this : { roles: {} }
		_.each(Roles.find().fetch(), function(roletype) {
			var type = roletype.type
			var should_have = roletype.preset || document.getElementById('role_'+type).checked;
			var have = !!course.roles[type]
			if (have && !should_have) delete course.roles[type];
			if (!have && should_have) course.roles[type] = roletype.protorole
		})

		var ofcourse = {
			description: $('#editform_description').val(),
			categories: $('#editform_categories input:checked').map(function(){ return this.name}).get(),
			name: $('#editform_name').val(),
			subscribers_min: $('#editform_subscr_min').val(),
			subscribers_max: $('#editform_subscr_max').val(),
			roles: course.roles
		}

		if (this._id) {
			Courses.update(this._id, { $set: ofcourse })
		} else {
			ofcourse.time_created = new Date
			ofcourse.region = Session.get('region')
			ofcourse.createdby = Meteor.userId()
			var id = Courses.insert(ofcourse)
			Router.setCourse( id, ofcourse.name);
		}

		Session.set("isEditing", false);
	},

	'click input.cancel': function() {
		Session.set("isEditing", false);
	}
});
