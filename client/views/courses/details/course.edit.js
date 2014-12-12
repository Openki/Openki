"use strict";

Template.course_edit.helpers({
	query: function() {
		return Session.get('search')
	},

	available_categories: function(parent) {
		var query = {}
		if (parent) {
			query.parent = parent;
		} else {
			query.parent = { $exists: false };
		}
		return Categories.find(query);
	},
	
	available_roles: function() {
		return Roles.find({'preset': { $ne: true }})
	},
	
	// Emit 'checked' string if id shows up as member or property of cats
	checked: function(id, cats) {
		if (cats === undefined) return;
		if (cats.length) {
			return cats.indexOf(id) >= 0 ? 'checked' : ''
		} else {
			return (id in cats) ? 'checked' : ''
		}
	},
	
	show_subcats: function(id, cats) {
		if (cats === undefined) return 'none';
		if (cats.length) {
			return cats.indexOf(id) >= 0 ? 'block' : 'none'
		} else {
			return (id in cats) ? 'block' : 'none'
		}
	},
	
	regions: function(){
	  return Regions.find();
	},
	
	currentRegion: function(region) {
		var currentRegion = Session.get('region')
		return currentRegion && region._id == currentRegion;
	}
});

Template.course_edit.rendered = function() {
	new MediumEditor(this.find('#editform_description'));
}

Template.course_edit.events({
	'submit form.course_edit, click input.save': function (ev) {
		ev.preventDefault()
		try {
			if (!Meteor.userId()){
			    alert("Please log in!")
			    throw "Please log in!"
			}
			
			var courseId = this._id ? this._id : ''
			var isNew = courseId === ''

			var roles = {}
			$('input.roleselection').each(function(_, rolecheck) {
				roles[rolecheck.name] = rolecheck.checked;
			})

			var changes = {
				description: $('#editform_description').html(),
				categories: $('#editform_categories input:checked').map(function(){ return this.name}).get(),
				name: $('#editform_name').val(),
				roles: roles
			}

			if (isNew) {
				changes.region = $('.region_select').val()
				if (!changes.region) {
					alert("Please select a region")
					return;
				}
			}
			
			Meteor.call("save_course", courseId, changes, function(err, courseId) {
				if (err) {
					addMessage(mf('course.saving.error', { ERROR: err }, 'Saving the course went wrong! Sorry about this. We encountered the following error: {ERROR}'));
				} else {
					Router.go('/course/'+courseId); // Router.go('showCourse', courseId) fails for an unknown reason
					addMessage(mf('course.saving.success', { NAME: changes.name }, 'Saved changes to {NAME}'));
				}
			})

			
		} catch(err) {
			if (err instanceof String) alert(err)
			else throw err
		}
		return false;
	},

	'click input.cancel': function() {
		Router.go('showCourse', this);
	},

	'click #show_categories_to_edit': function(event){
		$('#show_categories_to_edit').toggle();
		$('#edit_categories').toggle();
	},

	'change .categories .checkbox': function(){
		//$('#' + event.currentTarget.id +" .subcategories").toggle();
		$('#cat_' + this._id +" .subcategories").toggle();

		// todo: deselect all children
		var is_checked = $('#cat_' + this._id +" .checkbox").first().prop('checked');
		if(!is_checked)
			$('#cat_' + this._id +" .checkbox_sub").prop('checked', false);

	}
});


