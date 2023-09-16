import $ from 'jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Regions } from '/imports/api/regions/regions';
import { CourseModel } from '/imports/api/courses/courses';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'frameCourselistCourse',
	unknown,
	{ expanded: ReactiveVar<boolean> }
>;

const template = Template.frameCourselistCourse;

template.onCreated(function () {
	this.expanded = new ReactiveVar(false);
});

template.helpers({
	allRegions() {
		return Session.equals('region', 'all');
	},
	regionOf(course: CourseModel) {
		return Regions.findOne(course.region)?.name;
	},
	expanded() {
		return Template.instance().expanded.get();
	},
	interestedPersons(course: CourseModel) {
		return course.members.length;
	},
});

template.events({
	'click .js-toggle-course-details'(event, instance) {
		$(event.currentTarget).toggleClass('active');
		instance.expanded.set(!instance.expanded.get());
	},
});
