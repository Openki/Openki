import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import * as CoursesMethods from '/imports/api/courses/methods';
import { RoleEntity } from '/imports/api/roles/roles';
import { CourseModel } from '/imports/api/courses/courses';

import { Editable } from '/imports/ui/lib/editable';
import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import { PleaseLogin } from '/imports/ui/lib/please-login';
import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import * as Viewport from '/imports/ui/lib/viewport';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { Analytics } from '/imports/ui/lib/analytics';

import getLocalizedValue from '/imports/utils/getLocalizedValue';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/courses/discussion';
import '/imports/ui/components/courses/edit';
import '/imports/ui/components/courses/events/course-events';
import '/imports/ui/components/courses/history';
import '/imports/ui/components/courses/files';
import '/imports/ui/components/courses/members';
import '/imports/ui/components/courses/roles/course-roles';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/groups/list';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';

import './template.html';
import './styles.scss';

{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'courseDetailsPage',
			{
				edit: boolean;
				rolesDetails: {
					role: RoleEntity;
					subscribed: boolean;
					course: CourseModel;
				}[];
				course: CourseModel;
				member: boolean;
				select: string;
			},
			{ editableName: Editable; editableDescription: Editable }
		>,
		'courseDetailsPage',
	);

	const template = Template.courseDetailsPage;

	template.onCreated(function () {
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

	template.helpers({
		// more helpers in course.roles.js

		detailsHeaderAttr(course: CourseModel) {
			return {
				style: `
		background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${course?.publicImageUrl()}');
		background-position: center;
		background-size: cover;`,
			};
		},

		mayEdit(course: CourseModel) {
			return course?.editableBy(Meteor.user());
		},
		courseStateClasses(course: CourseModel) {
			const classes = [];

			if (course?.nextEvent) {
				classes.push('has-upcoming-events');
			} else if (course?.lastEvent) {
				classes.push('has-past-events');
			} else {
				classes.push('is-proposal');
			}

			if (course?.archived) {
				classes.push('is-archived');
			}

			return classes.join(' ');
		},
		mobileViewport() {
			return Viewport.get().width <= ScssVars.screenMD;
		},
		isProposal(course: CourseModel) {
			return !course.nextEvent && !course.lastEvent;
		},
		isArchived(course: CourseModel) {
			return course?.archived;
		},
	});

	template.events({
		async 'click .js-delete-course-confirm'(_event, instance) {
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

		async 'click .js-course-archive'(_event, instance) {
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

		async 'click .js-course-unarchive'(_event, instance) {
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

		'click .js-course-edit'(_event, instance) {
			instance.collapse();
			if (PleaseLogin()) {
				return;
			}

			const { course } = instance.data;
			Router.go('showCourse', course, { query: { edit: 'course' } });
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseDetailsSubmenu',
		{
			edit: boolean;
			rolesDetails: {
				role: RoleEntity;
				subscribed: boolean;
				course: CourseModel;
			}[];
			course: CourseModel;
			member: boolean;
			select: string;
		}
	>;

	const template = Template.courseDetailsSubmenu;

	template.helpers({
		mayEdit() {
			const { course } = Template.instance().data;
			return course?.editableBy(Meteor.user());
		},
		additionalInfos() {
			const { course } = Template.instance().data;
			const user = Meteor.user();

			const isEditor = user && course.editableBy(user);

			return (
				course.additionalInfos
					?.filter((i) => i.visibleFor === 'all' || (i.visibleFor === 'editors' && isEditor))
					.map((i) => ({
						displayText: getLocalizedValue(i.displayText),
						value: i.value,
					})) || []
			);
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseDetailsDescription',
		{
			edit: boolean;
			rolesDetails: {
				role: RoleEntity;
				subscribed: boolean;
				course: CourseModel;
			}[];
			course: CourseModel;
			member: boolean;
			select: string;
		}
	>;

	const template = Template.courseDetailsDescription;

	template.helpers({
		mayEdit() {
			const { course } = Template.instance().data;
			return course?.editableBy(Meteor.user());
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<'courseGroupList', CourseModel>;

	const template = Template.courseGroupList;

	template.helpers({
		isOrganizer(groupId: string) {
			const course = Template.instance().data;
			return course.groupOrganizers.includes(groupId);
		},
		tools(groupId: string) {
			const tools = [];
			const user = Meteor.user();
			const course = Template.instance().data;
			if (user?.mayPromoteWith(groupId) || course.editableBy(user)) {
				tools.push({
					template: 'courseGroupRemove',
					data: { groupId, course },
				});
			}
			if (user && course.editableBy(user)) {
				const hasOrgRights = course.groupOrganizers.includes(groupId);
				tools.push({
					template: hasOrgRights ? 'courseGroupRemoveOrganizer' : 'courseGroupMakeOrganizer',
					data: { groupId, course },
				});
			}
			return tools;
		},
	});
}
{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<'courseGroupAdd', CourseModel>,
		'courseGroupAdd',
	);
	const template = Template.courseGroupAdd;
	template.helpers(GroupNameHelpers);
	template.helpers({
		groupsToAdd() {
			const course = Template.instance().data;
			const user = Meteor.user();
			return user && _.difference(user.groups, course.groups);
		},
	});

	template.events({
		async 'click .js-add-group'(event, instance) {
			const course = instance.data;
			const groupId = (event.currentTarget as HTMLInputElement).value;

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
}
{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'courseGroupRemove',
			{ groupId: string; course: CourseModel }
		>,
		'courseGroupRemove',
	);
	const template = Template.courseGroupRemove;
	template.helpers(GroupNameHelpers);
	template.events({
		async 'click .js-remove'(_event, instance) {
			const { course, groupId } = instance.data;

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
}
{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'courseGroupMakeOrganizer',
			{ groupId: string; course: CourseModel }
		>,
		'courseGroupMakeOrganizer',
	);
	const template = Template.courseGroupMakeOrganizer;
	template.helpers(GroupNameHelpers);
	template.events({
		async 'click .js-makeOrganizer'(_event, instance) {
			const { course, groupId } = instance.data;

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
}
{
	const Template = TemplateMixins.Expandible(
		TemplateAny as TemplateStaticTyped<
			'courseGroupRemoveOrganizer',
			{ groupId: string; course: CourseModel }
		>,
		'courseGroupRemoveOrganizer',
	);
	const template = Template.courseGroupRemoveOrganizer;
	template.helpers(GroupNameHelpers);
	template.events({
		async 'click .js-removeOrganizer'(_event, instance) {
			const { course, groupId } = instance.data;

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
}
