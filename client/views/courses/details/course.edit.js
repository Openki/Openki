"use strict";

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

// Emit 'checked' string if id shows up as member or property of cats
Template.course_edit.checked = function(id, cats) {
	if (cats === undefined) return;
	if (cats.length) {
		return cats.indexOf(id) >= 0 ? 'checked' : ''
	} else {
		return (id in cats) ? 'checked' : ''
	}
}


Template.course_edit.show_subcats = function(id, cats) {
	if (cats === undefined) return 'none';
	if (cats.length) {
		return cats.indexOf(id) >= 0 ? 'block' : 'none'
	} else {
		return (id in cats) ? 'block' : 'none'
	}
}


Template.course_edit.events({
	'submit form.course_edit, click input.save': function (ev) {
		ev.preventDefault()
		
		try {
			if (!Meteor.userId()) throw "Security robot say: please sign in!"
			
			var courseId = this._id ? this._id : ''
			var isNew = courseId === ''

			var roles = {}
			$('input.roleselection').each(function(_, rolecheck) {
				roles[rolecheck.name] = rolecheck.checked;
			})

			var changes = {
				description: $('#editform_description').val(),
				categories: $('#editform_categories input:checked').map(function(){ return this.name}).get(),
				name: $('#editform_name').val(),
				roles: roles
			}

			if (isNew) {
				changes.region = Session.get('region')
				if (!changes.region) throw "Please select a region"
			}
			
			var courseId = Meteor.call("save_course", this._id ? this._id : '', changes)
			Session.set("isEditing", false);
			if (isNew) Router.go('showCourse', {_id: courseId})
		} catch(err) {
			if (err instanceof String) alert(err)
			else throw err
		}
	},

	'click input.cancel': function() {
		Session.set("isEditing", false);
	},

	'click #show_categories_to_edit': function(event){
		$('#show_categories_to_edit').toggle();
		$('#edit_categories').toggle();
	},

	'change .checkbox': function(){
		//$('#' + event.currentTarget.id +" .subcategories").toggle();
		$('#cat_' + this._id +" .subcategories").toggle();

		// todo: deselect all children
		var is_checked = $('#cat_' + this._id +" .checkbox").first().prop('checked');
		if(!is_checked)
			$('#cat_' + this._id +" .checkbox_sub").prop('checked', false);

	}
});


