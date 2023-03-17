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
import '/imports/ui/components/courses/display/group-list/remove-organizer';

import './template.html';


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
