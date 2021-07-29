import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import * as CoursesMethods from '/imports/api/courses/methods';

import { Editable } from '/imports/ui/lib/editable';
import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import { PleaseLogin } from '/imports/ui/lib/please-login';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import TemplateMixins from '/imports/ui/lib/template-mixins';
import * as Viewport from '/imports/ui/lib/viewport';

import { _ } from 'meteor/underscore';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Analytics } from '/imports/ui/lib/analytics';

import * as IdTools from '/imports/utils/id-tools';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/courses/categories/course-categories';
import '/imports/ui/components/courses/discussion/course-discussion';
import '/imports/ui/components/courses/edit/course-edit';
import '/imports/ui/components/courses/events/course-events';
import '/imports/ui/components/courses/history/course-history';
import '/imports/ui/components/courses/members/course-members';
import '/imports/ui/components/courses/roles/course-roles';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/groups/list/group-list';
import '/imports/ui/components/price-policy/price-policy';
import '/imports/ui/components/regions/tag/region-tag';
import '/imports/ui/components/sharing/sharing';
import '/imports/ui/components/report/report';

import './template.html';
import './styles.scss';

TemplateMixins.Expandible(Template.courseDetailsPage);
Template.courseDetailsPage.onCreated(function () {
	const instance = this;

	instance.busy(false);

	const { course } = instance.data;

	instance.editableName = new Editable(true, mf('course.title.placeholder'), {
		onSave: async (newName) => {
			await CoursesMethods.save(course._id, { name: newName });
		},
		onSuccess: (newName) => {
			Alert.success(
				mf(
					'courseDetails.message.nameChanged',
					{ NAME: newName },
					'The name of this course has been changed to "{NAME}".',
				),
			);
		},
		onError: (err) => {
			Alert.serverError(err, mf('course.save.error', 'Saving the course went wrong'));
		},
	});

	instance.editableDescription = new Editable(false, mf('course.description.placeholder'), {
		onSave: async (newDescription) => {
			await CoursesMethods.save(course._id, { description: newDescription });
		},
		onSuccess: () => {
			Alert.success(
				mf(
					'courseDetails.message.descriptionChanged',
					{ NAME: course.name },
					'The description of "{NAME}" has been changed.',
				),
			);
		},
		onError: (err) => {
			Alert.serverError(err, mf('course.save.error'));
		},
	});

	this.autorun(() => {
		const data = Template.currentData();
		const { name: courseName, description: courseDescription } = data.course;

		instance.editableName.setText(courseName);
		instance.editableDescription.setText(courseDescription);
	});
});

Template.courseDetailsPage.helpers({
	// more helpers in course.roles.js

	mayEdit() {
		return this.course?.editableBy(Meteor.user());
	},
	courseStateClasses() {
		const classes = [];

		if (this.course?.nextEvent) {
			classes.push('has-upcoming-events');
		} else if (this.course?.lastEvent) {
			classes.push('has-past-events');
		} else {
			classes.push('is-proposal');
		}

		if (this.course?.archived) {
			classes.push('is-archived');
		}

		return classes.join(' ');
	},
	mobileViewport() {
		return Viewport.get().width <= ScssVars.screenMD;
	},
	isProposal() {
		return !this.course.nextEvent && !this.course.lastEvent;
	},
	isArchived() {
		return this.course.archived;
	},
	editableName() {
		return Template.instance().editableName;
	},
	editableDescription() {
		return Template.instance().editableDescription;
	},
});

Template.courseDetailsDescription.helpers({
	mayEdit() {
		return this.course?.editableBy(Meteor.user());
	},
});

Template.courseDetailsPage.events({
	async 'click .js-delete-course-confirm'(event, instance) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('deleting');

		try {
			await CoursesMethods.remove(course._id);

			Alert.success(
				mf(
					'courseDetailsPage.message.courseHasBeenDeleted',
					{ COURSE: course.name },
					'The course "{COURSE}" has been deleted.',
				),
			);

			let role;
			if (_.intersection(Meteor.user().badges, course.editors).length > 0) {
				role = 'team';
			} else if (UserPrivilegeUtils.privilegedTo('admin')) {
				role = 'admin';
			} else {
				role = 'unknown';
			}

			Analytics.trackEvent(
				'Course deletions',
				`Course deletions as ${role}`,
				Regions.findOne(course.region)?.nameEn,
			);

			Router.go('/');
		} catch (err) {
			Alert.serverError(err, 'Removing the course "{COURSE}" went wrong');
		} finally {
			instance.busy(false);
		}
	},

	async 'click .js-course-archive'(event, instance) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('archive');
		try {
			await CoursesMethods.archive(course._id);

			Alert.success(
				mf(
					'courseDetailsPage.message.courseHasBeenArchived',
					{ COURSE: course.name },
					'The course "{COURSE}" has been archived.',
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Archive the course "{COURSE}" went wrong');
		} finally {
			instance.busy(false);
		}
	},

	async 'click .js-course-unarchive'(event, instance) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('unarchive');
		try {
			await CoursesMethods.unarchive(course._id);

			Alert.success(
				mf(
					'courseDetailsPage.message.courseHasBeenUnarchived',
					{ COURSE: course.name },
					'The course "{COURSE}" has been unarchived.',
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Unarchive the course "{COURSE}" went wrong');
		} finally {
			instance.busy(false);
		}
	},

	'click .js-course-edit'(event, instance) {
		instance.collapse();
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		Router.go('showCourse', course, { query: { edit: 'course' } });
	},
});

Template.courseGroupList.helpers({
	isOrganizer() {
		return Template.instance().data.groupOrganizers.includes(IdTools.extract(this));
	},
	tools() {
		const tools = [];
		const user = Meteor.user();
		const groupId = String(this);
		const course = Template.parentData();
		if (user?.mayPromoteWith(groupId) || course.editableBy(user)) {
			tools.push({
				toolTemplate: Template.courseGroupRemove,
				groupId,
				course,
			});
		}
		if (user && course.editableBy(user)) {
			const hasOrgRights = course.groupOrganizers.includes(groupId);
			tools.push({
				toolTemplate: hasOrgRights
					? Template.courseGroupRemoveOrganizer
					: Template.courseGroupMakeOrganizer,
				groupId,
				course,
			});
		}
		return tools;
	},
});

TemplateMixins.Expandible(Template.courseGroupAdd);
Template.courseGroupAdd.helpers(GroupNameHelpers);
Template.courseGroupAdd.helpers({
	groupsToAdd() {
		const user = Meteor.user();
		return user && _.difference(user.groups, this.groups);
	},
});

Template.courseGroupAdd.events({
	async 'click .js-add-group'(event, instance) {
		const course = instance.data;
		const groupId = event.currentTarget.value;

		try {
			await CoursesMethods.promote(course._id, groupId, true);

			const groupName = Groups.findOne(groupId).name;
			Alert.success(
				mf(
					'courseGroupAdd.groupAdded',
					{ GROUP: groupName, COURSE: course.name },
					'The group "{GROUP}" has been added to promote the course "{COURSE}".',
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to add group');
		}
	},
});

TemplateMixins.Expandible(Template.courseGroupRemove);
Template.courseGroupRemove.helpers(GroupNameHelpers);
Template.courseGroupRemove.events({
	async 'click .js-remove'(event, instance) {
		const { course } = instance.data;
		const { groupId } = instance.data;

		try {
			await CoursesMethods.promote(course._id, groupId, false);

			const groupName = Groups.findOne(groupId).name;
			Alert.success(
				mf(
					'courseGroupAdd.groupRemoved',
					{ GROUP: groupName, COURSE: course.name },
					'The group "{GROUP}" has been removed from the course "{COURSE}".',
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to remove group');
		}
	},
});

TemplateMixins.Expandible(Template.courseGroupMakeOrganizer);
Template.courseGroupMakeOrganizer.helpers(GroupNameHelpers);
Template.courseGroupMakeOrganizer.events({
	async 'click .js-makeOrganizer'(event, instance) {
		const { course } = instance.data;
		const { groupId } = instance.data;

		try {
			await CoursesMethods.editing(course._id, groupId, true);

			const groupName = Groups.findOne(groupId).name;
			Alert.success(
				mf(
					'courseGroupAdd.membersCanEditCourse',
					{ GROUP: groupName, COURSE: course.name },
					'Members of the group "{GROUP}" can now edit the course "{COURSE}".',
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to give group editing rights');
		}
	},
});

TemplateMixins.Expandible(Template.courseGroupRemoveOrganizer);
Template.courseGroupRemoveOrganizer.helpers(GroupNameHelpers);
Template.courseGroupRemoveOrganizer.events({
	async 'click .js-removeOrganizer'(event, instance) {
		const { course } = instance.data;
		const { groupId } = instance.data;

		try {
			await CoursesMethods.editing(course._id, groupId, false);

			const groupName = Groups.findOne(groupId).name;
			Alert.success(
				mf(
					'courseGroupAdd.membersCanNoLongerEditCourse',
					{ GROUP: groupName, COURSE: course.name },
					'Members of the group "{GROUP}" can no longer edit the course "{COURSE}".',
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to remove organizer status');
		}
	},
});
