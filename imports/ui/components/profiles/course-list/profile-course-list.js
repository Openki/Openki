import { Template } from 'meteor/templating';
import Courses from '/imports/api/courses/courses';
import Roles from '/imports/api/roles/roles';

import ScssVars from '/imports/ui/lib/scss-vars';

import '/imports/ui/components/courses/list/course-list';
import '/imports/ui/components/loading/loading';

import './profile-course-list.html';

Template.usersCourselist.onCreated(function () {
	const instance = this;
	const id = instance.data.profileData.user._id;

	instance.courseSub = instance.subscribe('Courses.findFilter', { userInvolved: id });
	instance.coursesByRole = function (role) {
		return Courses.find({
			members: {
				$elemMatch: {
					user: id,
					roles: role,
				},
			},
		});
	};
});

Template.usersCourselist.helpers({
	roles() {
		return _.clone(Roles).reverse();
	},

	coursesByRoleCount(role) {
		return Template.instance().coursesByRole(role).count();
	},

	coursesByRole(role) {
		return Template.instance().coursesByRole(role);
	},

	roleUserList() {
		return `roles.${this.type}.userList`;
	},

	roleMyList() {
		return `roles.${this.type}.myList`;
	},

	// eslint-disable-next-line consistent-return
	getName() {
		const { username } = Template.instance().data.profileData.user;
		if (username) return username;
	},
	roleShort() {
		return `roles.${this.type}.short`;
	},
	ready() {
		return Template.instance().courseSub.ready();
	},
	isInvolved() {
		const userId = Template.instance().data.profileData.user._id;
		return Courses.findFilter({ userInvolved: userId }).count() > 0;
	},
});

Template.usersCourselist.events({
	'click .js-scroll'(event) {
		const roleLabel = event.currentTarget;
		const rolePosition = $(roleLabel.getAttribute('href')).offset().top;
		// subtract the amount of pixels of the height of the navbar
		$('html, body').animate({ scrollTop: rolePosition - ScssVars.navbarHeight });
		event.preventDefault();
	},
});
