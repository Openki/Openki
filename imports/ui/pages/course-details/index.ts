import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import * as CoursesMethods from '/imports/api/courses/methods';

import { Editable } from '/imports/ui/lib/editable';
import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import { PleaseLogin } from '/imports/ui/lib/please-login';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import * as Viewport from '/imports/ui/lib/viewport';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Analytics } from '/imports/ui/lib/analytics';

import * as IdTools from '/imports/utils/id-tools';
import getLocalizedValue from '/imports/utils/getLocalizedValue';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/courses/discussion';
import '/imports/ui/components/courses/edit';
import '/imports/ui/components/courses/events/course-events';
import '/imports/ui/components/courses/history';
import '/imports/ui/components/courses/image';
import '/imports/ui/components/courses/members/course-members';
import '/imports/ui/components/courses/roles/course-roles';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/groups/list';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';

import './template.html';
import './styles.scss';

TemplateMixins.Expandible(Template as any, 'courseDetailsPage');
Template.courseDetailsPage.onCreated(function (this: any) {
	const instance = this;

	instance.busy(false);

	const { course } = instance.data;

	instance.editableName = new Editable(true, i18n('course.title.placeholder'), {
		onSave: async (newName) => {
			await CoursesMethods.save(course._id, { name: newName });
		},
		onSuccess: (newName) => {
			Alert.success(
				i18n(
					'courseDetails.message.nameChanged',
					'The name of this course has been changed to "{NAME}".',
					{ NAME: newName },
				),
			);
		},
		onError: (err) => {
			Alert.serverError(err, i18n('course.save.error', 'Saving the course went wrong'));
		},
	});

	instance.editableDescription = new Editable(false, i18n('course.description.placeholder'), {
		onSave: async (newDescription) => {
			await CoursesMethods.save(course._id, { description: newDescription });
		},
		onSuccess: () => {
			Alert.success(
				i18n(
					'courseDetails.message.descriptionChanged',
					'The description of "{NAME}" has been changed.',
					{ NAME: course.name },
				),
			);
		},
		onError: (err) => {
			Alert.serverError(err, i18n('course.save.error'));
		},
	});

	this.autorun(() => {
		const data = Template.currentData();

		if (!data.course) {
			return;
		}

		const { name: courseName, description: courseDescription } = data.course;

		instance.editableName.setText(courseName);
		instance.editableDescription.setText(courseDescription);
	});
});

Template.courseDetailsPage.helpers({
	// more helpers in course.roles.js

	detailsHeaderAttr() {
		return {
			style: `
	background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${this.course?.publicImageUrl()}');
	background-position: center;
	background-size: cover;`,
		};
	},

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
		return this.course?.archived;
	},
});

Template.courseDetailsPage.events({
	async 'click .js-delete-course-confirm'(_event: any, instance: any) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('deleting');

		try {
			await CoursesMethods.remove(course._id);

			Alert.success(
				i18n(
					'courseDetailsPage.message.courseHasBeenDeleted',
					'The "{COURSE}" course was deleted.',
					{ COURSE: course.name },
				),
			);

			let role;
			if (_.intersection(Meteor.user()?.badges || [], course.editors).length > 0) {
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
			Alert.serverError(err, 'Removing the "{COURSE}" course went wrong');
		} finally {
			instance.busy(false);
		}
	},

	async 'click .js-course-archive'(_event: any, instance: any) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('archive');
		try {
			await CoursesMethods.archive(course._id);

			Alert.success(
				i18n(
					'courseDetailsPage.message.courseHasBeenArchived',
					'The "{COURSE}" course was archived.',
					{ COURSE: course.name },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Archive the course "{COURSE}" went wrong');
		} finally {
			instance.busy(false);
		}
	},

	async 'click .js-course-unarchive'(_event: any, instance: any) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('unarchive');
		try {
			await CoursesMethods.unarchive(course._id);

			Alert.success(
				i18n(
					'courseDetailsPage.message.courseHasBeenUnarchived',
					'The "{COURSE}" course has been unarchived.',
					{ COURSE: course.name },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Unarchive the "{COURSE}" course went wrong');
		} finally {
			instance.busy(false);
		}
	},

	'click .js-course-edit'(_event: any, instance: any) {
		instance.collapse();
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		Router.go('showCourse', course, { query: { edit: 'course' } });
	},
});

Template.courseDetailsSubmenu.helpers({
	mayEdit() {
		return this.course?.editableBy(Meteor.user());
	},
	additionalInfos() {
		const user = Meteor.user();

		const course = Template.instance().data.course;

		const isEditor = user && course.editableBy(user);

		return (
			course.additionalInfos
				?.filter((i: any) => i.visibleFor === 'all' || (i.visibleFor === 'editors' && isEditor))
				.map((i: any) => ({
					displayText: getLocalizedValue(i.displayText),
					value: i.value,
				})) || []
		);
	},
});

Template.courseDetailsDescription.helpers({
	mayEdit() {
		return this.course?.editableBy(Meteor.user());
	},
});

Template.courseGroupList.helpers({
	isOrganizer() {
		return (Template.instance().data as any).groupOrganizers.includes(IdTools.extract(this));
	},
	tools() {
		const tools = [];
		const user = Meteor.user();
		const groupId = String(this);
		const course = (Template as any).parentData();
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

TemplateMixins.Expandible(Template as any, 'courseGroupAdd');
Template.courseGroupAdd.helpers(GroupNameHelpers);
Template.courseGroupAdd.helpers({
	groupsToAdd() {
		const user = Meteor.user();
		return user && _.difference(user.groups, this.groups);
	},
});

Template.courseGroupAdd.events({
	async 'click .js-add-group'(event: any, instance: any) {
		const course = instance.data;
		const groupId = event.currentTarget.value;

		try {
			await CoursesMethods.promote(course._id, groupId, true);

			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				i18n(
					'courseGroupAdd.groupAdded',
					'The "{GROUP}" group was added to promote the "{COURSE}" course.',
					{ GROUP: groupName, COURSE: course.name },
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to add group');
		}
	},
});

TemplateMixins.Expandible(Template as any, 'courseGroupRemove');
Template.courseGroupRemove.helpers(GroupNameHelpers);
Template.courseGroupRemove.events({
	async 'click .js-remove'(_event: any, instance: any) {
		const { course } = instance.data;
		const { groupId } = instance.data;

		try {
			await CoursesMethods.promote(course._id, groupId, false);

			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				i18n(
					'courseGroupAdd.groupRemoved',
					'The "{GROUP}" group was removed from the "{COURSE}" course.',
					{ GROUP: groupName, COURSE: course.name },
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to remove group');
		}
	},
});

TemplateMixins.Expandible(Template as any, 'courseGroupMakeOrganizer');
Template.courseGroupMakeOrganizer.helpers(GroupNameHelpers);
Template.courseGroupMakeOrganizer.events({
	async 'click .js-makeOrganizer'(_event: any, instance: any) {
		const { course } = instance.data;
		const { groupId } = instance.data;

		try {
			await CoursesMethods.editing(course._id, groupId, true);

			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				i18n(
					'courseGroupAdd.membersCanEditCourse',
					'Members of the "{GROUP}" group can now edit the "{COURSE}" course.',
					{ GROUP: groupName, COURSE: course.name },
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to give group editing rights');
		}
	},
});

TemplateMixins.Expandible(Template as any, 'courseGroupRemoveOrganizer');
Template.courseGroupRemoveOrganizer.helpers(GroupNameHelpers);
Template.courseGroupRemoveOrganizer.events({
	async 'click .js-removeOrganizer'(_event: any, instance: any) {
		const { course } = instance.data;
		const { groupId } = instance.data;

		try {
			await CoursesMethods.editing(course._id, groupId, false);

			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				i18n(
					'courseGroupAdd.membersCanNoLongerEditCourse',
					'Members of the "{GROUP}" group can no longer edit the "{COURSE}" course.',
					{ GROUP: groupName, COURSE: course.name },
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(err, 'Failed to remove organizer status');
		}
	},
});
