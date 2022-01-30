import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { CourseEntity, CourseModel, Courses } from '/imports/api/courses/courses';
import { RoleEntity, Roles } from '/imports/api/roles/roles';
import { UserModel } from '/imports/api/users/users';

import { ScssVars } from '/imports/ui/lib/scss-vars';

import '/imports/ui/components/courses/list/course-list';
import '/imports/ui/components/loading';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'usersCourselist',
	{
		user: UserModel;
		ownProfile: boolean
	},
	{
		courseSub: Meteor.SubscriptionHandle;
		coursesByRole: (role: string, archived: boolean) => Mongo.Cursor<CourseEntity, CourseModel>;
	}
>;

const template = Template.usersCourselist;

template.onCreated(function () {
	const instance = this;
	const id = instance.data.user._id;

	instance.courseSub = instance.subscribe('Courses.findFilter', {
		userInvolved: id,
		archived: false,
	});
	instance.courseSub = instance.subscribe('Courses.findFilter', {
		userInvolved: id,
		archived: true,
	});

	instance.coursesByRole = (role: string, archived: boolean) =>
		Courses.find({
			members: {
				$elemMatch: {
					user: id,
					roles: role,
				},
			},
			archived: archived ? { $eq: true } : { $ne: true },
		});
});

Template.usersCourselist.helpers({
	roles() {
		return _.clone(Roles).reverse();
	},

	coursesByRoleCount(role: string, archived: boolean) {
		return Template.instance().coursesByRole(role, archived).count();
	},

	coursesByRole(role: string, archived: boolean) {
		return Template.instance().coursesByRole(role, archived);
	},

	roleUserList(role: string) {
		return `roles.${role}.userList`;
	},

	roleUserListPast(role: string) {
		return `roles.${role}.userList.past`;
	},

	roleMyList(role: string) {
		return `roles.${role}.myList`;
	},

	roleMyListPast(role: string) {
		return `roles.${role}.myList.past`;
	},

	getName() {
		const { username } = Template.currentData().user;
		if (username) {
			return username;
		}
		return false;
	},
	ready() {
		return Template.instance().courseSub.ready();
	},
	isInvolved() {
		const userId = Template.currentData().user._id;
		return (
			Courses.findFilter({ userInvolved: userId, archived: false }, 1).count() > 0 ||
			Courses.findFilter({ userInvolved: userId, archived: true }, 1).count() > 0
		);
	},
	showArchived(role: RoleEntity) {
		return role.type === 'team';
	},
});

Template.usersCourselist.events({
	'click .js-scroll'(event) {
		const roleLabel = event.currentTarget;
		const rolePosition = $(roleLabel.getAttribute('href') || '').offset()?.top || 0;
		// subtract the amount of pixels of the height of the navbar
		$('html, body').animate({ scrollTop: rolePosition - ScssVars.navbarHeight });
		event.preventDefault();
	},
});
