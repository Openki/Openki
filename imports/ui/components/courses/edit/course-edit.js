import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Categories from '/imports/api/categories/categories';
import Courses from '/imports/api/courses/courses';
import Groups from '/imports/api/groups/groups';
import Regions from '/imports/api/regions/regions';
import Roles from '/imports/api/roles/roles';

import StringTools from '/imports/utils/string-tools';
import Editable from '/imports/ui/lib/editable';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import Alert from '/imports/api/alerts/alert';
import { HasRoleUser } from '/imports/utils/course-role-utils';


import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/courses/categories/course-categories';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/price-policy/price-policy';
import '/imports/ui/components/regions/tag/region-tag';

import './course-edit.html';

Template.courseEdit.onCreated(function () {
	const instance = this;

	instance.busy(false);

	// Show category selection right away for new courses
	const editingCategories = !this.data || !this.data._id;
	this.editingCategories = new ReactiveVar(editingCategories);
	this.selectedCategories = new ReactiveVar(this.data && this.data.categories || []);

	instance.editableDescription = new Editable(
		false,
		false,
		mf('course.description.placeholder', 'Describe your idea, so that more people will find it and that they`ll know what to expect.'),
		false,
	);

	instance.autorun(() => {
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
			this.$('.js-check-role').each(function () {
				this.checked = false;
				$(this).trigger('change');
			});
		};
	}
});

Template.courseEdit.helpers({
	query() {
		return Session.get('search');
	},

	availableCategories() {
		return Object.keys(Categories);
	},

	availableSubcategories(category) {
		// Hide if parent categories not selected
		const selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.indexOf(category) < 0) return [];

		return Categories[category];
	},

	editingCategories() {
		return Template.instance().editingCategories.get();
	},

	availableRoles() {
		return Roles.filter((role) => {
			// Roles that are always on are not selectable here
			if (role.preset) return false;

			// In the normal view, all roles are selectable
			if (!this.isFrame) return true;

			const { neededRoles } = this;
			if (neededRoles && neededRoles.length) {
				if (!neededRoles.includes(role.type)) return false;
			} else if (role.type === 'host') return false;

			return true;
		});
	},

	roleDescription() {
		return `roles.${this.type}.description`;
	},

	roleSubscription() {
		return `roles.${this.type}.subscribe`;
	},

	isChecked() {
		const selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length && selectedCategories.indexOf(`${this}`) >= 0) {
			return 'checkbox-checked';
		}
		return '';
	},

	checkCategory() {
		const selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.length) {
			return selectedCategories.indexOf(`${this}`) >= 0 ? 'checked' : '';
		}
	},

	hasRole() {
		const instance = Template.instance();
		return instance.data && instance.data.members && HasRoleUser(instance.data.members, this.type, Meteor.userId()) ? 'checked' : null;
	},

	showRegionSelection() {
		// Region can be set for new courses only.
		// For the proposal frame we hide the region selection when a region
		// is set.
		return !this._id && !(this.region && this.isFrame);
	},

	regions() {
		return Regions.find();
	},

	currentRegion(region) {
		const currentRegion = Session.get('region');
		return currentRegion && region._id === currentRegion;
	},

	isInternal() {
		return this.internal ? 'checked' : null;
	},

	proposeFromQuery() {
		const parentInstance = Template.instance().parentInstance();
		const { filter } = parentInstance;
		if (!filter) return false;

		const { search } = filter.toParams();
		if (!search) return false;

		const filterQuery = filter.toQuery();
		const results = Courses.findFilter(filterQuery, 1);

		return (results.count() === 0) && search;
	},

	courseSearch() {
		const parentInstance = Template.instance().parentInstance();
		const filterParams = parentInstance.filter.toParams();

		return filterParams.search;
	},

	editableDescription() {
		return Template.instance().editableDescription;
	},

	newCourseGroupName() {
		if (this.group) {
			const groupId = this.group;
			const group = Groups.findOne(groupId);
			if (group) return group.name;
		}
	},

	showInternalCheckbox() {
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
	},
});


Template.courseEdit.events({

	'click .close': function (event, instance) {
		instance.showSavedMessage.set(false);
	},

	'submit form, click .js-course-edit-save': function (event, instance) {
		event.preventDefault();

		const roles = {};
		instance.$('.js-check-role').each(function () {
			roles[this.name] = this.checked;
		});

		// for frame: if a group id is given, check for the internal flag in the
		// url query
		const internal = instance.data.group
			? instance.data.internal || false
			: instance.$('.js-check-internal').is(':checked');

		const changes = {
			roles,
			internal,
			name: StringTools.saneTitle(instance.$('#editform_name').val()),
			categories: instance.selectedCategories.get(),
		};

		if (changes.name.length === 0) {
			alert('Please provide a title');
			return;
		}

		const newDescription = instance.editableDescription.getEdited();
		if (newDescription) changes.description = newDescription;

		const course = instance.data;
		const courseId = course._id ? course._id : '';
		const isNew = courseId === '';
		if (isNew) {
			const { data } = instance;
			if (data.isFrame && data.region) {
				// The region was preset for the frame
				changes.region = data.region;
			} else {
				changes.region = instance.$('.region_select').val();
			}
			if (!changes.region) {
				alert('Please select a region');
				return;
			}

			const groups = [];
			if (data.group) {
				groups.push(data.group);
			}
			changes.groups = groups;
		}

		changes.subs = [];
		changes.unsubs = [];
		instance.$('.js-check-enroll').each(function () {
			const role = this.name;
			const subscribe = !!this.checked;
			if (subscribe) {
				changes.subs.push(role);
			} else {
				changes.unsubs.push(role);
			}
		});

		instance.busy('saving');
		SaveAfterLogin(instance, mf('loginAction.saveCourse', 'Login and save course'), () => {
			Meteor.call('course.save', courseId, changes, (err, courseId) => {
				instance.busy(false);
				if (err) {
					Alert.error(err, 'Saving the course went wrong');
				} else if (instance.data.isFrame) {
					instance.savedCourseId.set(courseId);
					instance.showSavedMessage.set(true);
					instance.resetFields();
				} else {
					if (isNew) {
						Alert.success(mf(
							'message.courseCreated',
							{ NAME: changes.name },
							'The course "{NAME}" has been created!',
						));
					} else {
						Alert.success(mf(
							'message.courseChangesSaved',
							{ NAME: changes.name },
							'Your changes to the course "{NAME}" have been saved.',
						));
					}

					Router.go('showCourse', { _id: courseId });
				}
			});
		});
	},

	'click .js-course-edit-cancel': function (event, instance) {
		const course = instance.data;

		if (course._id) {
			Router.go('showCourse', course);
		} else {
			Router.go('/');
		}
	},

	'click .js-edit-categories': function () {
		Template.instance().editingCategories.set(true);
	},

	'change .js-category-checkbox': function (event, instance) {
		const catKey = `${this}`;
		let selectedCategories = instance.selectedCategories.get();
		const checked = instance.$(`input.cat_${catKey}`).prop('checked');
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
	},
});

Template.courseEditRole.onCreated(function () {
	this.checked = new ReactiveVar(false);
});

Template.courseEditRole.onRendered(function () {
	const { data } = this;
	const selectedRoles = data.selected;

	if (selectedRoles) {
		this.checked.set(
			selectedRoles.indexOf(data.role.type) >= 0,
		);
	}
});

Template.courseEditRole.helpers({
	roleDescription() {
		return `roles.${this.role.type}.description`;
	},

	roleSubscription() {
		return `roles.${this.role.type}.subscribe`;
	},

	checkRole() {
		const instance = Template.instance();
		return instance.checked.get() ? 'checked' : null;
	},

	hasRole() {
		return this.members && HasRoleUser(this.members, this.role.type, Meteor.userId()) ? 'checked' : null;
	},
});

Template.courseEditRole.events({
	'change .js-check-role': function (event, instance) {
		instance.checked.set(instance.$('.js-check-role').prop('checked'));
	},
});

Template.courseTitle.onCreated(function () {
	this.proposedSearch = new ReactiveVar('');
	this.focused = new ReactiveVar(false);

	this.dropdownVisible = () => this.focused.get() && this.proposedSearch.get().length > 3;

	this.autorun(() => {
		if (this.dropdownVisible()) {
			this.subscribe('Courses.findFilter', { search: this.proposedSearch.get(), region: Session.get('region') });
			if (!this.$('.dropdown').hasClass('open')) {
				this.$('.dropdown-toggle').dropdown('toggle');
			}
		}
	});
});

Template.courseTitle.helpers({
	proposedCourses() {
		const instance = Template.instance();
		const search = instance.proposedSearch.get();
		const region = Session.get('region');
		if (instance.dropdownVisible()) {
			return Courses.findFilter({ search, region }, 20, [['name', 1]]);
		}
		return [];
	},
});

Template.courseTitle.events({
	'keydown .js-title': function (event, instance) {
		if (event.keyCode === 9) {
			instance.$('.dropdown-toggle').dropdown('toggle');
			instance.focused.set(false);
		}
	},

	'keyup .js-title': function (event, instance) {
		// arrow down does not work in bootstrap dropdown widget
		if (event.keyCode === 40) {
			instance.$('.js-proposed-courses').find('a:first').focus();
		}
	},

	'input .js-title': _.debounce((event, instance) => {
		instance.proposedSearch.set(event.target.value);
	}, 220),


	'focus .js-title': function (event, instance) {
		instance.focused.set(true);
	},

	'focusout .js-proposed-search': function (event, instance) {
		if (instance.$(event.relatedTarget).closest('.js-proposed-search').length === 0) instance.focused.set(false);
	},

	'keydown .js-dropdown-entry': function (event, instance) {
		if (event.keyCode === 9 && !event.shiftKey) instance.$('.dropdown-toggle').dropdown('toggle');
	},
});
