import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import moment from 'moment';

import { Roles } from '/imports/api/roles/roles';
import {  CourseModel } from '/imports/api/courses/courses';

import { hasRole, hasRoleUser } from '/imports/utils/course-role-utils';

import '/imports/ui/components/courses/categories';
import '/imports/ui/components/groups/list';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<'courseCompact', CourseModel>;

	const template = Template.courseCompact;

	template.helpers({
		courseCss(course: CourseModel) {
			if (!course.nextEvent) {
				return '';
			}

			const src = course?.publicImageUrl();
			if (!src) {
				return '';
			}

			return `
		background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}');
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;`;
		},

		courseStateClasses() {
			const classes = [];

			if (this.nextEvent) {
				classes.push('has-upcoming-events');
			} else if (this.lastEvent) {
				classes.push('has-past-events');
			} else {
				classes.push('is-proposal');
			}

			if (this.archived) {
				classes.push('is-archived');
			}

			return classes.join(' ');
		},

		filterPreviewClasses(this: CourseModel) {
			const filterPreviewClasses = [];
			const course = this;

			const roles = Roles.map((role) => role.type);

			roles.forEach((role) => {
				const roleDisengaged = !hasRole(course.members, role);
				if (course.roles.includes(role) && roleDisengaged) {
					filterPreviewClasses.push(`needs-role-${role}`);
				}
			});

			course.categories?.forEach((category) => {
				filterPreviewClasses.push(`category-${category}`);
			});

			course.groups?.forEach((group) => {
				filterPreviewClasses.push(`group-${group}`);
			});

			filterPreviewClasses.push(`region-${course.region}`);

			return filterPreviewClasses.join(' ');
		},

		isOrganizer(this: CourseModel, groupId: any) {
			return this.groupOrganizers.includes(groupId);
		},
	});

	template.events({
		'mouseover .js-group-label, mouseout .js-group-label'(_e, instance) {
			instance.$('.course-compact').toggleClass('elevate-child');
		},

		'mouseover .js-category-label, mouseout .js-category-label'(_e, instance) {
			instance.$('.course-compact').toggleClass('elevate-child');
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'courseCompactEvent', CourseModel>;

	const template = Template.courseCompactEvent;

	template.helpers({
		dateToRelativeString(date: moment.MomentInput) {
			if (date) {
				const relative = moment().to(date);
				return relative.charAt(0).toUpperCase() + relative.slice(1);
			}
			return false;
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'courseCompactRoles', CourseModel>;

	const template = Template.courseCompactRoles;

	template.helpers({
		requiresRole(this: CourseModel, role: string) {
			return this.roles.includes(role);
		},

		participantClass(this: CourseModel) {
			let participantClass = 'course-compact-role-';

			const { members } = this;
			if (hasRoleUser(members, 'participant', Meteor.userId())) {
				participantClass += 'occupied-by-user';
			} else if (members.length) {
				participantClass += 'occupied';
			} else {
				participantClass += 'needed';
			}

			return participantClass;
		},

		participantTooltip(this: CourseModel) {
			let tooltip;
			const numMembers = this.interested;
			const isParticipant = hasRoleUser(this.members, 'participant', Meteor.userId());

			if (numMembers === 1 && isParticipant) {
				tooltip = i18n('course.compact.youAreInterested', 'You are interested');
			} else {
				tooltip = i18n(
					'course.compact.interestedCount',
					'{NUM, plural, =0{Nobody is} one{One person is} other{# persons are} } interested',
					{ NUM: numMembers },
				);

				if (numMembers > 1 && isParticipant) {
					tooltip += ' ';
					tooltip += i18n('course.compact.interestedCountOwn', 'and you are one of them');
				}
			}

			return tooltip;
		},

		roleStateClass(this: CourseModel, role: string) {
			let roleStateClass = 'course-compact-role-';
			if (!hasRole(this.members, role)) {
				roleStateClass += 'needed';
			} else if (hasRoleUser(this.members, role, Meteor.userId())) {
				roleStateClass += 'occupied-by-user';
			} else {
				roleStateClass += 'occupied';
			}

			return roleStateClass;
		},

		roleStateTooltip(this: CourseModel, role: 'team' | 'mentor' | 'host') {
			let roleStateTooltip;

			const tooltips = {
				team: {
					needed: i18n('course.list.status_titles.needs_organizer', 'Needs an organizer'),
					occupied: i18n('course.list.status_titles.has_team', 'Has an organizer-team'),
					occupiedByUser: i18n('course.list.status_titles.u_are_organizer', 'You are organizer'),
				},
				mentor: {
					needed: i18n('course.list.status_titles.needs_mentor', 'Needs a mentor'),
					occupied: i18n('course.list.status_titles.has_mentor', 'Has a mentor'),
					occupiedByUser: i18n('course.list.status_titles.u_are_mentor', 'You are mentor'),
				},
				host: {
					needed: i18n('course.list.status_titles.needs_host', 'Needs a host'),
					occupied: i18n('course.list.status_titles.has_host', 'Has a host'),
					occupiedByUser: i18n('course.list.status_titles.u_are_host', 'You are host'),
				},
			};

			if (!hasRole(this.members, role)) {
				roleStateTooltip = tooltips[role].needed;
			} else if (hasRoleUser(this.members, role, Meteor.userId())) {
				roleStateTooltip = tooltips[role].occupiedByUser;
			} else {
				roleStateTooltip = tooltips[role].occupied;
			}

			return roleStateTooltip;
		},
	});
}
