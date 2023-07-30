import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Roles } from '/imports/api/roles/roles';
import { CourseModel } from '/imports/api/courses/courses';

import { hasRole } from '/imports/utils/course-role-utils';

import '/imports/ui/components/courses/categories';
import '/imports/ui/components/groups/tag';
import '/imports/ui/components/internal-indicator';
import './course-compact-event';
import './course-compact-roles';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'courseCompact',
		{
			course: CourseModel;
			groupTagEvents: (groupId: string) => {
				onMouseOver: () => void;
				onMouseOut: () => void;
				onClick: () => void;
			};
		}
	>;

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

		courseStateClasses(course: CourseModel) {
			const classes = [];

			if (course.nextEvent) {
				classes.push('has-upcoming-events');
			} else if (course.lastEvent) {
				classes.push('has-past-events');
			} else {
				classes.push('is-proposal');
			}

			if (course.archived) {
				classes.push('is-archived');
			}

			return classes.join(' ');
		},

		filterPreviewClasses(course: CourseModel) {
			const filterPreviewClasses = [];

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

		groupTagAttr(course: CourseModel, groupId: string) {
			const instance = Template.instance();
			return {
				groupId,
				isOrganizer: course.groupOrganizers.includes(groupId),
				onClick: () => {
					instance.data.groupTagEvents(groupId).onClick();
				},
				onMouseOver: () => {
					instance.$('.course-compact').toggleClass('elevate-child');
					instance.data.groupTagEvents(groupId).onMouseOver();
				},
				onMouseOut: () => {
					instance.$('.course-compact').toggleClass('elevate-child');
					instance.data.groupTagEvents(groupId).onMouseOut();
				},
			};
		},
	});

	template.events({
		'mouseover .js-category-label, mouseout .js-category-label'(_e, instance) {
			instance.$('.course-compact').toggleClass('elevate-child');
		},
	});
}
