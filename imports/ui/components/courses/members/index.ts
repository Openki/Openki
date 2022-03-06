import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Roles } from '/imports/api/roles/roles';
import { Subscribe, Unsubscribe, Message, processChange } from '/imports/api/courses/subscription';
import { CourseMemberEntity, CourseModel } from '/imports/api/courses/courses';
import { Users } from '/imports/api/users/users';

import { Editable } from '/imports/ui/lib/editable';
import { hasRoleUser } from '/imports/utils/course-role-utils';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

import '/imports/ui/components/editable';
import '/imports/ui/components/participant/contact';
import '/imports/ui/components/profile-link';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseMembers',
		CourseModel,
		{ increaseBy: number; membersDisplayLimit: ReactiveVar<number> }
	>;

	const template = Template.courseMembers;

	template.onCreated(function () {
		this.increaseBy = 10;
		this.membersDisplayLimit = new ReactiveVar(this.increaseBy);
	});

	template.helpers({
		howManyEnrolled() {
			const course = Template.instance().data;
			return course.members.length;
		},

		canNotifyAll() {
			const course = Template.instance().data;
			return hasRoleUser(course.members, 'team', Meteor.userId());
		},

		ownUserMember() {
			const course = Template.instance().data;
			return course.members.find((member) => member.user === Meteor.userId());
		},

		sortedMembers() {
			const { members } = Template.instance().data;
			members.sort((a, b) => {
				const aRoles = a.roles.filter((role) => role !== 'participant');
				const bRoles = b.roles.filter((role) => role !== 'participant');
				return bRoles.length - aRoles.length;
			});
			// check if logged-in user is in members and if so put him on top
			const userId = Meteor.userId();
			if (userId && members.some((member) => member.user === userId)) {
				const userArrayPosition = members.findIndex((member) => member.user === userId);
				const currentMember = members[userArrayPosition];
				// remove current user form array and readd him at index 0
				members.splice(userArrayPosition, 1); // remove
				members.splice(0, 0, currentMember); // readd
			}
			return members.slice(0, Template.instance().membersDisplayLimit.get());
		},

		limited() {
			const membersDisplayLimit = Template.instance().membersDisplayLimit.get();
			return membersDisplayLimit && this.members.length > membersDisplayLimit;
		},
	});

	template.events({
		'click .js-contact-members'() {
			$('.course-page-btn.js-discussion-edit').trigger('notifyAll');
		},

		'click .js-show-more-members'(_e, instance) {
			const { membersDisplayLimit } = instance;
			membersDisplayLimit.set(membersDisplayLimit.get() + instance.increaseBy);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseMember',
		{ member: CourseMemberEntity; course: CourseModel },
		{
			editableMessage: Editable;
			subscribeToTeam: () => Subscribe | undefined;
			removeFromTeam: () => Unsubscribe | undefined;
		}
	>;

	const template = Template.courseMember;

	template.onCreated(function () {
		const instance = this;
		const data = instance.data;

		instance.subscribe('user', data.member.user);

		instance.editableMessage = new Editable(
			true,
			i18n('roles.message.placeholder', 'My interests…'),
			{
				onSave: async (newMessage) => {
					const change = new Message(data.course, Meteor.user(), newMessage);
					await processChange(change);
				},
				onSuccess: () => {
					Alert.success(
						i18n('courseMember.messageChanged', 'Your enroll-message has been changed.'),
					);
				},
			},
		);

		instance.autorun(() => {
			const { member } = Template.currentData();
			instance.editableMessage.setText(member.comment);
		});

		instance.subscribeToTeam = () => {
			const user = Users.findOne(data.member.user);
			if (!user) return undefined; // Probably not loaded yet

			return new Subscribe(data.course, user, 'team');
		};

		instance.removeFromTeam = () => {
			const user = Users.findOne(data.member.user);
			if (!user) return undefined; // Probably not loaded yet

			return new Unsubscribe(data.course, user, 'team');
		};
	});

	template.helpers({
		ownUserMemberClass() {
			const { member } = Template.instance().data;
			if (member.user === Meteor.userId()) {
				return 'is-own-user';
			}
			return '';
		},

		memberRoles() {
			const { member } = Template.instance().data;
			return member.roles.filter((role) => role !== 'participant');
		},

		maySubscribeToTeam() {
			const change = Template.instance().subscribeToTeam?.();
			return change?.validFor(Meteor.user());
		},

		rolelistIcon(roletype: string) {
			if (roletype !== 'participant') {
				return Roles.find((role) => role.type === roletype)?.icon || '';
			}
			return '';
		},

		editableMessage() {
			const { member } = Template.instance().data;
			const mayChangeComment = member.user === Meteor.userId();
			return mayChangeComment && Template.instance().editableMessage;
		},

		mayUnsubscribeFromTeam(label: string) {
			if (label !== 'team') {
				return false;
			}
			const change = Template.instance().removeFromTeam();
			return change && change.validFor(Meteor.user());
		},

		showMemberComment() {
			const { member } = Template.instance().data;
			const mayChangeComment = member.user === Meteor.userId();
			return member.comment || mayChangeComment;
		},
	});

	template.events({
		'click .js-add-to-team-btn'(event, instance) {
			event.preventDefault();
			const change = instance.subscribeToTeam();
			if (!change) {
				throw new Error('Unexpected falsy: change');
			}
			processChange(change);
		},
		'click .js-remove-team'(event, instance) {
			event.preventDefault();
			const change = instance.removeFromTeam();
			if (!change) {
				throw new Error('Unexpected falsy: change');
			}
			processChange(change);
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<
		'removeFromTeamDropdown',
		{ member: CourseMemberEntity; course: CourseModel }
	>;

	const template = Template.removeFromTeamDropdown;

	template.helpers({
		isNotPriviledgedSelf() {
			const { member } = Template.instance().data;
			const notPriviledgedUser = !UserPrivilegeUtils.privilegedTo('admin');
			return member.user === Meteor.userId() && notPriviledgedUser;
		},
	});
}
