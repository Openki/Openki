import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { CourseModel } from '/imports/api/courses/courses';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'courseEventAdd', { course: CourseModel }>;

const template = Template.courseEventAdd;

template.events({
	'mouseover/mouseout .event-caption-action'(event, instance) {
		instance
			.$(event.currentTarget as any)
			.toggleClass('event-caption-placeholder', event.type === 'mouseout');
	},
});
