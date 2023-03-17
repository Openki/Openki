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
import '/imports/ui/components/courses/display/group-list/remove';
import '/imports/ui/components/courses/display/group-list/make-organizer';
import '/imports/ui/components/courses/display/group-list/remove-organizer';

import './template.html';

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
