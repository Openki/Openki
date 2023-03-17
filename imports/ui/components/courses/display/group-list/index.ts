import { Meteor } from 'meteor/meteor';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import * as CoursesMethods from '/imports/api/courses/methods';
import { CourseModel } from '/imports/api/courses/courses';

import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

import { i18n } from '/imports/startup/both/i18next';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/courses/discussion';
import '/imports/ui/components/courses/edit';
import '/imports/ui/components/courses/events';
import '/imports/ui/components/courses/history';
import '/imports/ui/components/courses/files';
import '/imports/ui/components/courses/members';
import '/imports/ui/components/courses/roles';
import '/imports/ui/components/editable';
import '/imports/ui/components/groups/tag';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';
import '/imports/ui/components/internal-indicator';

import './template.html';

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
					i18n('courseGroupAdd.groupAdded', '{GROUP} was added to promote {COURSE}.', {
						GROUP: groupName,
						COURSE: course.name,
					}),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, i18n('courseGroupAdd.groupAdded.error', 'Adding failed'));
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
					i18n('courseGroupAdd.groupRemoved', '{GROUP} was removed from {COURSE}.', {
						GROUP: groupName,
						COURSE: course.name,
					}),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(err, i18n('courseGroupAdd.groupRemoved.error', 'Removing failed'));
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
					i18n('courseGroupAdd.membersCanEditCourse', 'Members of {GROUP} can now edit {COURSE}.', {
						GROUP: groupName,
						COURSE: course.name,
					}),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(
					err,
					i18n('courseGroupAdd.membersCanEditCourse.error', 'Failed to give editing rights'),
				);
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
						'Members of {GROUP} can no longer edit {COURSE}.',
						{ GROUP: groupName, COURSE: course.name },
					),
				);
				instance.collapse();
			} catch (err) {
				Alert.serverError(
					err,
					i18n(
						'courseGroupAdd.membersCanNoLongerEditCourse.error',
						'Failed to remove organizer status',
					),
				);
			}
		},
	});
}
