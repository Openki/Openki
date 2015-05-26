"use strict";

Template.course_edit.helpers({
	query: function() {
		return Session.get('search')
	},

	available_categories: function(parent) {
		if (parent) {
			return categories[parent];
		} else {
			return Object.keys(categories);
		}
	},
	
	available_roles: function() {
		return Roles.find({'preset': { $ne: true }})
	},

	roleDescription: function() {
		return 'roles.'+this.type+'.description';
	},

	// Emit 'checked' string if id shows up as member or property of cats
	checked: function(cat, cats) {
		if (!cats) return;
		if (cats.length) {
			return cats.indexOf(cat) >= 0 ? 'checked' : ''
		}
	},
	
	show_subcats: function(id, cats) {
		if (!cats) return 'none';
		if (cats.length) {
			return cats.indexOf(id) >= 0 ? 'block' : 'none'
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
	var desc = this.find('#editform_description');
	if (desc) new MediumEditor(desc);
}

Template.course_edit.events({
	'submit form.course_edit, click button.save': function (ev) {
		ev.preventDefault()
		try {
			if (pleaseLogin()) return;
			
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
			
			changes.name = saneText(changes.name);
			
			if (changes.name.length == 0) {
				alert("Please provide a title")
				return;
			}

			if (isNew) {
				changes.region = $('.region_select').val();
				if (!changes.region) {
					alert("Please select a region")
					return;
				}
			}
			
			Meteor.call("save_course", courseId, changes, function(err, courseId) {
				if (err) {
					addMessage(mf('course.saving.error', { ERROR: err }, 'Saving the course went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
				} else {
					Router.go('/course/'+courseId); // Router.go('showCourse', courseId) fails for an unknown reason
					addMessage(mf('course.saving.success', { NAME: changes.name }, 'Saved changes to course "{NAME}"'), 'success');
				}
			})

			
		} catch(err) {
			if (err instanceof String) alert(err)
			else throw err
		}
		return false;
	},

	'click button.cancel': function() {
		if (this._id) {
			Router.go('showCourse', this);
		}
		Router.go('/');
	},

	'click #show_categories_to_edit': function(event){
		$('#show_categories_to_edit').toggle(1000);
		$('#edit_categories').toggle(1000);
	},

	'change .categories .checkbox': function(){
		$('#cat_' + this +" .subcategories").toggle();

		var is_checked = $('#cat_' + this +" .checkbox").first().prop('checked');
		if(!is_checked) {
			$('#cat_' + this +" .checkbox_sub").prop('checked', false);
		}
	}
});


