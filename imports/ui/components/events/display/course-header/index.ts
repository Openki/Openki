import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { CourseModel } from '/imports/api/courses/courses';
import { EventModel } from '/imports/api/events/events';

import '/imports/ui/components/buttons';
import '/imports/ui/components/courses/categories';
import '/imports/ui/components/events/edit';
import '/imports/ui/components/events/participants';
import '/imports/ui/components/events/replication';
import '/imports/ui/components/groups/list';
import '/imports/ui/components/price-policy';
import '/imports/ui/components/regions/tag';
import '/imports/ui/components/sharing';
import '/imports/ui/components/report';
import '/imports/ui/components/venues/link';

import './template.html';
import './styles.scss';

export type Data = {
	regionId: string;
	image: string;
};

const Template = TemplateAny as TemplateStaticTyped<'eventCourseHeader', Data>;

const template = Template.eventCourseHeader;

template.helpers({
	eventCourseHeaderAttr(course: CourseModel) {
		const src = course?.publicImageUrl();
		if (!src) {
			return {};
		}

		return {
			style: `
	background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${src}');
	background-position: center;
	background-size: cover;`,
		};
	},
});

template.events({
	'mouseover .event-course-header, mouseout .event-course-header'(event, instance) {
		instance.$(event.currentTarget as any).toggleClass('highlight', event.type === 'mouseover');
	},

	'click .event-course-header'() {
		Router.go('showCourse', { _id: this.courseId });
	},
});
