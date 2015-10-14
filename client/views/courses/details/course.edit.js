"use strict";

Template.course_edit.created = function() {
	// Show category selection right away for new courses
	var editingCategories = !this.data || !this.data._id;
	this.editingCategories = new ReactiveVar(editingCategories);
	this.selectedCategories = new ReactiveVar(this.data && this.data.categories || []);
}

Template.course_edit.helpers({
	query: function() {
		return Session.get('search')
	},

	availableCategories: function() {
		return Object.keys(categories);
	},

	availableSubcategories: function(category) {
		// Hide if parent categories not selected
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.indexOf(category) < 0) return [];

		return categories[category];
	},

	editingCategories: function() {
		return Template.instance().editingCategories.get();
	},
	
	available_roles: function() {
		return Roles.find({'preset': { $ne: true }})
	},

	roleDescription: function() {
		return 'roles.'+this.type+'.description';
	},

	activeCategory: function() {
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length && selectedCategories.indexOf(this) >= 0) {
			return 'active';
		}
		return '';
	},

	checkCategory: function() {
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length) {
			return selectedCategories.indexOf(this) >= 0 ? 'checked' : ''
		}
	},

	checkRole: function() {
		var instance = Template.instance();
		return instance.data && instance.data.roles && instance.data.roles.indexOf(this.type) >= 0 ? 'checked' : null;
	},

	hasRole: function() {
		var instance = Template.instance();
		return instance.data && instance.data.members && hasRoleUser(instance.data.members, this.type, Meteor.userId()) ? 'checked' : null;
	},
	
	regions: function() {
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
	'submit form, click button.save': function (ev, instance) {
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
				categories: instance.selectedCategories.get(),
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

				var groups = [];
				if (Router.current().params.query.group) {
					groups.push(Router.current().params.query.group);
				}
				changes.groups = groups;
			}
			
			Meteor.call("save_course", courseId, changes, function(err, courseId) {
				if (err) {
					addMessage(mf('course.saving.error', { ERROR: err }, 'Saving the course went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
				} else {
					Router.go('/course/'+courseId); // Router.go('showCourse', courseId) fails for an unknown reason
					addMessage(mf('course.saving.success', { NAME: changes.name }, 'Saved changes to course "{NAME}".'), 'success');

					$('input.-enrol').each(function(_, enrolcheck) {
						Meteor.call( enrolcheck.checked? 'add_role' : 'remove_role', courseId, Meteor.userId(), enrolcheck.name, false);
					});
				}
			})

			
		} catch(err) {
			if (err instanceof String) alert(err)
			else throw err
		}
		return false;
	},

	'click button.cancel': function(event) {
		if (this._id) {
			Router.go('showCourse', this);
		} else {
			Router.go('/');
		}
	},

	'click button.editCategories': function (event, template) {
		Template.instance().editingCategories.set(true);
	},

	'change .categories input': function(event, instance) {
		var selectedCategories = instance.selectedCategories.get();
		var checked = instance.$('input.cat_'+this).prop('checked');
		if (checked) {
			selectedCategories.push(this);
			selectedCategories = _.uniq(selectedCategories);
		} else {
			selectedCategories = _.without(selectedCategories, this);

			if (categories[this]) {
				// Remove all the subcategories as well
				selectedCategories = _.difference(selectedCategories, categories[this]);
			}
		}

		instance.selectedCategories.set(selectedCategories);
	}
});


