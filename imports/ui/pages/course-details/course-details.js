import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';

import { Editable } from '/imports/ui/lib/editable';
import GroupNameHelpers from '/imports/ui/lib/group-name-helpers';
import { PleaseLogin } from '/imports/ui/lib/please-login';
import ScssVars from '/imports/ui/lib/scss-vars';
import TemplateMixins from '/imports/ui/lib/template-mixins';

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

import './course-details.html';

TemplateMixins.Expandible(Template.courseDetailsPage);
Template.courseDetailsPage.onCreated(function () {
	const instance = this;

	instance.busy(false);

	const { course } = instance.data;

	instance.editableName = new Editable(
		true,
		mf('course.title.placeholder'),
		(newName) => {
			Meteor.call('course.save', course._id, { name: newName }, (err) => {
				if (err) {
					Alert.serverError(
						err,
						mf('course.save.error', 'Saving the course went wrong'),
					);
				} else {
					Alert.success(mf(
						'courseDetails.message.nameChanged',
						{ NAME: newName },
						'The name of this course has been changed to "{NAME}".',
					));
				}
			});
		},
	);

	instance.editableDescription = new Editable(
		false,
		mf('course.description.placeholder'),
		(newDescription) => {
			Meteor.call('course.save', course._id, { description: newDescription }, (err) => {
				if (err) {
					Alert.serverError(
						err,
						mf('course.save.error'),
					);
				} else {
					Alert.success(mf(
						'courseDetails.message.descriptionChanged',
						{ NAME: course.name },
						'The description of "{NAME}" has been changed.',
					));
				}
			});
		},
	);

	this.autorun(() => {
		const data = Template.currentData();
		const { name: courseName, description: courseDescription } = data.course;

		instance.editableName.setText(courseName);
		instance.editableDescription.setText(courseDescription);
	});
});

Template.courseDetailsPage.helpers({ // more helpers in course.roles.js
	mayEdit() {
		return this.course?.editableBy(Meteor.user());
	},
	coursestate() {
		if (this.nextEvent) {
			return 'has-upcoming-events';
		}
		if (this.lastEvent) {
			return 'has-past-events';
		}
		return 'is-proposal';
	},
	mobileViewport() {
		return Session.get('viewportWidth') <= ScssVars.screenMD;
	},
	isProposal() {
		return !this.course.nextEvent && !this.course.lastEvent;
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
	'click .js-delete-course-confirm'(event, instance) {
		if (PleaseLogin()) {
			return;
		}

		const { course } = instance.data;
		instance.busy('deleting');
		Meteor.call('course.remove', course._id, (err) => {
			instance.busy(false);
			if (err) {
				Alert.serverError(
					err,
					'Removing the course "{COURSE}" went wrong',
				);
			} else {
				Alert.success(mf(
					'courseDetailsPage.message.courseHasBeenDeleted',
					{ COURSE: course.name },
					'The course "{COURSE}" has been deleted.',
				));

				let role;
				if (_.intersection(Meteor.user().badges, course.editors).length > 0) {
					role = 'team';
				} else if (UserPrivilegeUtils.privilegedTo('admin')) {
					role = 'admin';
				} else {
					role = 'unknown';
				}
				Analytics.trackEvent('Course deletions', `Course deletions as ${role}`, Regions.findOne(course.region)?.nameEn);
			}
		});
		Router.go('/');
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
		return Template.instance().data.groupOrganizers.indexOf(IdTools.extract(this)) >= 0;
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
			const hasOrgRights = course.groupOrganizers.indexOf(groupId) > -1;
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
	'click .js-add-group'(event, instance) {
		const course = instance.data;
		const groupId = event.currentTarget.value;
		Meteor.call('course.promote', course._id, groupId, true, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to add group',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'courseGroupAdd.groupAdded',
					{ GROUP: groupName, COURSE: course.name },
					'The group "{GROUP}" has been added to promote the course "{COURSE}".',
				));
				instance.collapse();
			}
		});
	},
});


TemplateMixins.Expandible(Template.courseGroupRemove);
Template.courseGroupRemove.helpers(GroupNameHelpers);
Template.courseGroupRemove.events({
	'click .js-remove'(event, instance) {
		const { course } = instance.data;
		const { groupId } = instance.data;
		Meteor.call('course.promote', course._id, groupId, false, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to remove group',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'courseGroupAdd.groupRemoved',
					{ GROUP: groupName, COURSE: course.name },
					'The group "{GROUP}" has been removed from the course "{COURSE}".',
				));
				instance.collapse();
			}
		});
	},
});


TemplateMixins.Expandible(Template.courseGroupMakeOrganizer);
Template.courseGroupMakeOrganizer.helpers(GroupNameHelpers);
Template.courseGroupMakeOrganizer.events({
	'click .js-makeOrganizer'(event, instance) {
		const { course } = instance.data;
		const { groupId } = instance.data;
		Meteor.call('course.editing', course._id, groupId, true, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to give group editing rights',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'courseGroupAdd.membersCanEditCourse',
					{ GROUP: groupName, COURSE: course.name },
					'Members of the group "{GROUP}" can now edit the course "{COURSE}".',
				));
				instance.collapse();
			}
		});
	},
});


TemplateMixins.Expandible(Template.courseGroupRemoveOrganizer);
Template.courseGroupRemoveOrganizer.helpers(GroupNameHelpers);
Template.courseGroupRemoveOrganizer.events({
	'click .js-removeOrganizer'(event, instance) {
		const { course } = instance.data;
		const { groupId } = instance.data;
		Meteor.call('course.editing', course._id, groupId, false, (err) => {
			if (err) {
				Alert.serverError(
					err,
					'Failed to remove organizer status',
				);
			} else {
				const groupName = Groups.findOne(groupId).name;
				Alert.success(mf(
					'courseGroupAdd.membersCanNoLongerEditCourse',
					{ GROUP: groupName, COURSE: course.name },
					'Members of the group "{GROUP}" can no longer edit the course "{COURSE}".',
				));
				instance.collapse();
			}
		});
	},
});
