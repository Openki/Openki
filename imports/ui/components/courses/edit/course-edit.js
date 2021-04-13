import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import * as Alert from '/imports/api/alerts/alert';
import Categories from '/imports/api/categories/categories';
import { Courses } from '/imports/api/courses/courses';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import { Roles } from '/imports/api/roles/roles';

import Editable from '/imports/ui/lib/editable';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';

import * as StringTools from '/imports/utils/string-tools';
import { HasRoleUser } from '/imports/utils/course-role-utils';
import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/courses/categories/course-categories';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/price-policy/price-policy';
import '/imports/ui/components/regions/tag/region-tag';

import './course-edit.html';

Template.courseEdit.onCreated(function () {
	this.busy(false);

	// Show category selection right away for new courses
	const editingCategories = !this.data || !this.data._id;
	this.editingCategories = new ReactiveVar(editingCategories);
	this.selectedCategories = new ReactiveVar(this.data?.categories || []);

	this.editableDescription = new Editable(
		false,
		mf('course.description.placeholder', 'Describe your idea, so that more people will find it and that they`ll know what to expect.'),
	);

	this.autorun(() => {
		this.editableDescription.setText(Template.currentData().description);
	});

	if (!this.data.isFrame) {
		if (this.data.group) this.subscribe('group', this.data.group);
	} else if (this.data.teamGroups) {
		this.data.teamGroups.forEach((g) => {
			this.subscribe('group', g);
		});
	}

	this.showInternalCheckbox = new ReactiveVar(false);
	this.autorun(() => {
		let internalOption = false;
		const user = Meteor.user();
		if (!this.data.isFrame && this.data.group && user?.groups) {
			// show only if user is in the given group
			internalOption = user.groups.includes(this.data.group);
		}
		this.showInternalCheckbox.set(internalOption);
	});

	this.fullRoleSelection = true;

	if (this.data.isFrame) {
		// When we're in the propose frame, show a simplified role selection
		this.simpleRoleSelection = this.data.roles.includes('mentor');
		this.fullRoleSelection = false;

		// Keep state of simple role selection
		this.simpleSelectedRole = new ReactiveVar('participant');

		this.savedCourseId = new ReactiveVar(false);
		this.showSavedMessage = new ReactiveVar(false);

		this.autorun(() => {
			const courseId = this.savedCourseId.get();
			if (courseId) {
				this.subscribe('courseDetails', courseId);
			}
		});

		this.getSavedCourse = () => Courses.findOne(this.savedCourseId.get());

		this.resetFields = () => {
			this.$('.js-title').val('');
			this.$('.editable-textarea').html('');
			this.selectedCategories.set([]);
			this.simpleSelectedRole.set('participant');
		};
	}
});

Template.courseEdit.helpers({
	simpleRoleSelection() {
		return Template.instance().simpleRoleSelection;
	},

	fullRoleSelection() {
		return Template.instance().fullRoleSelection;
	},

	simpleRoleActiveClass(role) {
		// HACK using btn-add and btn-edit to show activation state
		// It would be better to introduce own classes for this task.
		if (Template.instance().simpleSelectedRole.get() === role) {
			return 'btn-add active';
		}
		return 'btn-edit';
	},

	query() {
		return Session.get('search');
	},

	availableCategories() {
		return Object.keys(Categories);
	},

	hasSubcategories(category) {
		return Categories[category].length > 0;
	},

	availableSubcategories(category) {
		// Hide if parent categories not selected
		const selectedCategories = Template.instance().selectedCategories.get();
		if (selectedCategories.indexOf(category) < 0) {
			return [];
		}

		return Categories[category];
	},

	editingCategories() {
		return Template.instance().editingCategories.get();
	},

	availableRoles() {
		return Roles.filter((role) => {
			// Roles that are always on are not selectable here
			if (role.preset) {
				return false;
			}

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
		return selectedCategories.includes(`${this}`) ? 'checkbox-checked' : '';
	},

	checkCategory() {
		const selectedCategories = Template.instance().selectedCategories.get();
		return selectedCategories.includes(`${this}`) ? 'checked' : '';
	},

	hasRole() {
		const instance = Template.instance();
		return instance.data?.members && HasRoleUser(instance.data.members, this.type, Meteor.userId()) ? 'checked' : null;
	},

	showRegionSelection() {
		// Region can be set for new courses only.
		// For the proposal frame we hide the region selection when a region
		// is set.
		return !this._id && !(this.region && this.isFrame);
	},

	hideCategories() {
		return this.isFrame && this.hideCategories;
	},

	isInternal() {
		return this.internal ? 'checked' : null;
	},

	proposeFromQuery() {
		const parentInstance = Template.instance().parentInstance();
		const { filter } = parentInstance;
		if (!filter) {
			return false;
		}

		const { search } = filter.toParams();
		if (!search) {
			return false;
		}

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
			if (group) {
				return group.name;
			}
		}
		return false;
	},

	showInternalCheckbox() {
		return Template.instance().showInternalCheckbox.get();
	},

	showSavedMessage() {
		if (this.isFrame) {
			return Template.instance().showSavedMessage.get();
		}
		return false;
	},

	savedCourseLink() {
		if (this.isFrame) {
			const course = Template.instance().getSavedCourse();
			if (course) {
				return Router.url('showCourse', course);
			}
		}
		return false;
	},

	savedCourseName() {
		if (this.isFrame) {
			const course = Template.instance().getSavedCourse();
			if (course) {
				return course.name;
			}
		}
		return false;
	},

	editBodyClasses() {
		const classes = [];

		if (Template.instance().data.isFrame) {
			classes.push('is-frame');
		}

		return classes.join(' ');
	},

	hasPricePolicy() {
		return !Template.instance().data.hidePricePolicy;
	},
});


Template.courseEdit.events({
	'change input[name=role]'(event, instance) {
		instance.simpleSelectedRole.set(
			instance.$('input[name=role]:checked').val(),
		);
	},

	'click .close'(event, instance) {
		instance.showSavedMessage.set(false);
	},

	'submit form, click .js-course-edit-save'(event, instance) {
		event.preventDefault();

		const { data } = instance;
		const hasTeamGroups = Boolean(data.teamGroups?.length);

		let internal;
		if (instance.showInternalCheckbox.get()) {
			// Usually an "internal" checkbox is displayed so that the users of a group can choose
			// whether the course is internal or not.
			internal = instance.$('.js-check-internal').is(':checked');
		} else if (data.isFrame && hasTeamGroups) {
			// When in a frame for a group, the `internal` query-param can be set to control whether
			// the group wants the entered courses to be internal.
			internal = data.internal;
		}
		// Default is not internal
		internal = internal || false;

		const changes = {
			internal,
			name: StringTools.saneTitle(instance.$('.js-title').val()),
			categories: instance.selectedCategories.get(),
		};

		if (changes.name.length === 0) {
			Alert.serverError(mf('course.edit.error.title', 'Please provide a title'));
			return;
		}

		const newDescription = instance.editableDescription.getEdited();
		if (newDescription) {
			changes.description = newDescription;
		}

		const course = instance.data;
		const courseId = course._id || '';
		const isNew = courseId === '';
		if (isNew) {
			if (data.isFrame && data.region) {
				// The region was preset for the frame
				changes.region = data.region;
			} else {
				changes.region = instance.$('.js-select-region').val();
			}
			if (!changes.region) {
				Alert.serverError(mf('course.edit.error.region', 'Please select a region'));
				return;
			}

			const groups = [];
			if (!data.isFrame) {
				if (data.group) {
					groups.push(data.group);
				}
			} else if (hasTeamGroups) {
				groups.push(...data.teamGroups);
			}
			changes.groups = groups;
		}

		changes.roles = {};
		changes.subs = [];
		changes.unsubs = [];

		if (instance.simpleRoleSelection) {
			data.roles.forEach((role) => {
				changes.roles[role] = true;
			});
			if (instance.simpleSelectedRole.get() === 'mentor') {
				changes.subs.push('mentor');
			}
		}

		if (instance.fullRoleSelection) {
			instance.$('.js-check-role').each(function () {
				changes.roles[this.name] = this.checked;
			});
			instance.$('.js-check-enroll').each(function () {
				const role = this.name;
				const subscribe = Boolean(this.checked);
				if (subscribe) {
					changes.subs.push(role);
				} else {
					changes.unsubs.push(role);
				}
			});
		}

		instance.busy('saving');
		SaveAfterLogin(instance,
			mf('loginAction.saveCourse', 'Login and save course'),
			mf('registerAction.saveCourse', 'Register and save course'),
			() => {
				/* eslint-disable-next-line no-shadow */
				Meteor.call('course.save', courseId, changes, (err, courseId) => {
					instance.busy(false);
					if (err) {
						Alert.serverError(err, 'Saving the course went wrong');
					} else if (instance.data.isFrame) {
						instance.savedCourseId.set(courseId);
						instance.showSavedMessage.set(true);
						instance.resetFields();

						Analytics.trackEvent('Course creations',
							`Course creations as ${changes.subs.length > 0 ? changes.subs.sort().join(' and ') : 'participant'}`,
							Regions.findOne(changes.region)?.nameEn,
							instance.editableDescription.getTotalFocusTimeInSeconds());
					} else {
						if (isNew) {
							Alert.success(mf(
								'message.courseCreated',
								{ NAME: changes.name },
								'The course "{NAME}" has been created!',
							));
							Analytics.trackEvent('Course creations',
								`Course creations as ${changes.subs.length > 0 ? changes.subs.sort().join(' and ') : 'participant'}`,
								Regions.findOne(changes.region)?.nameEn,
								instance.editableDescription.getTotalFocusTimeInSeconds());
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

	'click .js-course-edit-cancel'(event, instance) {
		const course = instance.data;

		if (course._id) {
			Router.go('showCourse', course);
		} else {
			Router.go('/');
		}
	},

	'click .js-edit-categories'() {
		Template.instance().editingCategories.set(true);
	},

	'change .js-category-checkbox'(event, instance) {
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
	'change .js-check-role'(event, instance) {
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
	'keydown .js-title'(event, instance) {
		if (event.keyCode === 9) {
			instance.$('.dropdown-toggle').dropdown('toggle');
			instance.focused.set(false);
		}
	},

	'keyup .js-title'(event, instance) {
		// arrow down does not work in bootstrap dropdown widget
		if (event.keyCode === 40) {
			instance.$('.js-proposed-courses').find('a:first').focus();
		}
	},

	'input .js-title': _.debounce((event, instance) => {
		instance.proposedSearch.set(event.target.value);
	}, 220),


	'focus .js-title'(event, instance) {
		instance.focused.set(true);
	},

	'focusout .js-proposed-search'(event, instance) {
		if (instance.$(event.relatedTarget).closest('.js-proposed-search').length === 0) {
			instance.focused.set(false);
		}
	},

	'keydown .js-dropdown-entry'(event, instance) {
		if (event.keyCode === 9 && !event.shiftKey) {
			instance.$('.dropdown-toggle').dropdown('toggle');
		}
	},
});
