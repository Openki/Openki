import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Categories from '/imports/api/categories/categories.js';
import Courses from '/imports/api/courses/courses.js';
import Groups from '/imports/api/groups/groups.js';
import Regions from '/imports/api/regions/regions.js';
import Roles from '/imports/api/roles/roles.js';

import StringTools from '/imports/utils/string-tools.js';
import Editable from '/imports/ui/lib/editable.js';
import SaveAfterLogin from '/imports/ui/lib/save-after-login.js';
import ShowServerError from '/imports/ui/lib/show-server-error.js';
import { AddMessage } from '/imports/api/messages/methods.js';
import { HasRoleUser } from '/imports/utils/course-role-utils.js';


import '/imports/ui/components/buttons/buttons.js';
import '/imports/ui/components/courses/categories/course-categories.js';
import '/imports/ui/components/editable/editable.js';
import '/imports/ui/components/price-policy/price-policy.js';
import '/imports/ui/components/regions/tag/region-tag.js';

import './course-edit.html';

Template.courseEdit.created = function() {
	var instance = this;

	instance.busy(false);

	// Show category selection right away for new courses
	var editingCategories = !this.data || !this.data._id;
	this.editingCategories = new ReactiveVar(editingCategories);
	this.selectedCategories = new ReactiveVar(this.data && this.data.categories || []);

	instance.editableDescription = new Editable(
		false,
		false,
		mf('course.description.placeholder', "Describe your idea, so that more people will find it and that they`ll know what to expect."),
		false
	);

	instance.autorun(function() {
		instance.editableDescription.setText(Template.currentData().description);
	});

	if (instance.data.group) {
		instance.subscribe('group', instance.data.group);
	}

	if (this.data.isFrame) {
		this.savedCourse = new ReactiveVar(false);
		this.savedCourseId = new ReactiveVar(false);
		this.showSavedMessage = new ReactiveVar(false);

		this.autorun(() => {
			const courseId = this.savedCourseId.get();
			if (courseId) {
				this.subscribe('courseDetails', courseId, () => {
					this.savedCourse.set(Courses.findOne(courseId));
				});
			}
		});

		this.resetFields = () => {
			this.$('#editform_name').val('');
			this.$('.editable-textarea').html('');
			this.selectedCategories.set([]);
			this.$('.js-check-role').each(function() {
				this.checked = false;
				$(this).trigger('change');
			});
		};
	}
};

Template.courseEdit.helpers({
	query: function() {
		return Session.get('search');
	},

	availableCategories: function() {
		return Object.keys(Categories);
	},

	availableSubcategories: function(category) {
		// Hide if parent categories not selected
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.indexOf(category) < 0) return [];

		return Categories[category];
	},

	editingCategories: function() {
		return Template.instance().editingCategories.get();
	},

	availableRoles() {
		return Roles.filter(role => {
			// Roles that are always on are not selectable here
			if (role.preset) return false;

			// In the normal view, all roles are selectable
			if (!this.isFrame) return true;

			const neededRoles = this.neededRoles;
			if (neededRoles && neededRoles.length) {
				if (!neededRoles.includes(role.type)) return false;
			} else {
				if (role.type == 'host') return false;
			}

			return true;
		});
	},

	roleDescription: function() {
		return 'roles.'+this.type+'.description';
	},

	roleSubscription: function() {
		return 'roles.'+this.type+'.subscribe';
	},

	isChecked: function() {
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length && selectedCategories.indexOf(''+this) >= 0) {
			return 'checkbox-checked';
		}
		return '';
	},

	checkCategory: function() {
		var selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length) {
			return selectedCategories.indexOf(''+this) >= 0 ? 'checked' : '';
		}
	},

	hasRole: function() {
		var instance = Template.instance();
		return instance.data && instance.data.members && HasRoleUser(instance.data.members, this.type, Meteor.userId()) ? 'checked' : null;
	},

	showRegionSelection: function() {
		// Region can be set for new courses only.
		// For the proposal frame we hide the region selection when a region
		// is set.
		return !this._id && !(this.region && this.isFrame);
	},

	regions: function() {
		return Regions.find();
	},

	currentRegion: function(region) {
		var currentRegion = Session.get('region');
		return currentRegion && region._id == currentRegion;
	},

	isInternal: function() {
		return this.internal ? "checked" : null;
	},

	proposeFromQuery: function() {
		var parentInstance = Template.instance().parentInstance();
		var filter = parentInstance.filter;
		if (!filter) return false;

		var search = filter.toParams().search;
		if (!search) return false;

		var filterQuery = filter.toQuery();
		var results = Courses.findFilter(filterQuery, 1);

		return (results.count() === 0) && search;
	},

	courseSearch: function() {
		var parentInstance = Template.instance().parentInstance();
		var filterParams = parentInstance.filter.toParams();

		return filterParams.search;
	},

	editableDescription: function() {
		return Template.instance().editableDescription;
	},

	newCourseGroupName: function() {
		if (this.group) {
			var groupId = this.group;
			var group = Groups.findOne(groupId);
			if (group) return group.name;
		}
	},

	showInternalCheckbox: function() {
		const user = Meteor.user();

		if (this.isFrame) return false;
		if (user && user.groups) {
			return user.groups.length > 0;
		}

		return false;
	},

	showSavedMessage() {
		if (this.isFrame) {
			return Template.instance().showSavedMessage.get();
		}
	},

	savedCourseLink() {
		if (this.isFrame) {
			const course = Template.instance().savedCourse.get();
			if (course) return Router.url('showCourse', course);
		}
	},

	savedCourseName() {
		if (this.isFrame) {
			const course = Template.instance().savedCourse.get();
			if (course) return course.name;
		}
	},

	editBodyClasses() {
		const classes = [];

		if (Template.instance().data.isFrame) classes.push('is-frame');

		return classes.join(' ');
	}
});


Template.courseEdit.events({
	'click .close'(event, instance) {
		instance.showSavedMessage.set(false);
	},

	'submit form, click .js-course-edit-save'(event, instance) {
		event.preventDefault();

		const roles = {};
		instance.$('.js-check-role').each(function() {
			roles[this.name] = this.checked;
		});

		// for frame: if a group id is given, check for the internal flag in the
		// url query
		console.log(instance.data.internal);
		const internal =
			instance.data.group
			? instance.data.internal || false
			: instance.$('.js-check-internal').is(':checked');

		const changes = {
			roles,
			internal,
			name: StringTools.saneTitle(instance.$('#editform_name').val()),
			categories: instance.selectedCategories.get(),
		};

		if (changes.name.length === 0) {
			alert("Please provide a title");
			return;
		}

		const newDescription = instance.editableDescription.getEdited();
		if (newDescription) changes.description = newDescription;

		const course = instance.data;
		const courseId = course._id ? course._id : '';
		const isNew = courseId === '';
		if (isNew) {
			const data = instance.data;
			if (data.isFrame && data.region) {
				// The region was preset for the frame
				changes.region = data.region;
			} else {
				changes.region = instance.$('.region_select').val();
			}
			if (!changes.region) {
				alert("Please select a region");
				return;
			}

			const groups = [];
			if (data.group) {
				groups.push(data.group);
			}
			changes.groups = groups;
		}

		instance.busy('saving');
		SaveAfterLogin(instance, mf('loginAction.saveCourse', 'Login and save course'), () => {
			Meteor.call('course.save', courseId, changes, (err, courseId) => {
				instance.busy(false);
				if (err) {
					ShowServerError('Saving the course went wrong', err);
				} else {
					if (instance.data.isFrame) {
						instance.savedCourseId.set(courseId);
						instance.showSavedMessage.set(true);
						instance.resetFields();
					} else {
						AddMessage("\u2713 " + mf('_message.saved'), 'success');
						Router.go('showCourse', { _id: courseId });
					}

					instance.$('.js-check-enroll').each(function() {
						const method = this.checked ? 'course.addRole' : 'course.removeRole';
						Meteor.call(method, courseId, Meteor.userId(), this.name);
					});
				}
			});
		});
	},

	'click .js-course-edit-cancel': function(event, instance) {
		var course = instance.data;

		if (course._id) {
			Router.go('showCourse', course);
		} else {
			Router.go('/');
		}
	},

	'click .js-edit-categories': function (event, template) {
		Template.instance().editingCategories.set(true);
	},

	'change .js-category-checkbox': function(event, instance) {
		var catKey = ''+this;
		var selectedCategories = instance.selectedCategories.get();
		var checked = instance.$('input.cat_'+catKey).prop('checked');
		if (checked) {
			selectedCategories.push(catKey);
			selectedCategories = _.uniq(selectedCategories);
		} else {
			selectedCategories = _.without(selectedCategories, catKey);

			if (Categories[catKey]) {
				// Remove all the subcategories as well
				selectedCategories = _.difference(selectedCategories, Categories[catKey]);
			}
		}

		instance.selectedCategories.set(selectedCategories);
	}
});

Template.courseEditRole.onCreated(function() {
	this.checked = new ReactiveVar(false);
});

Template.courseEditRole.onRendered(function() {
	const data = this.data;
	const selectedRoles = data.selected;

	if (selectedRoles) {
		this.checked.set(
			selectedRoles.indexOf(data.role.type) >= 0
		);
	}
});

Template.courseEditRole.helpers({
	roleDescription: function() {
		return 'roles.'+this.role.type+'.description';
	},

	roleSubscription: function() {
		return 'roles.'+this.role.type+'.subscribe';
	},

	checkRole: function() {
		var instance = Template.instance();
		return instance.checked.get() ? "checked" : null;
	},

	hasRole: function() {
		return this.members && HasRoleUser(this.members, this.role.type, Meteor.userId()) ? 'checked' : null;
	},
});

Template.courseEditRole.events({
	"change .js-check-role": function(event, instance) {
		instance.checked.set(instance.$(".js-check-role").prop("checked"));
	}
});
