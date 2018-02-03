import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import Regions from '/imports/api/regions/regions.js';
import Courses from '/imports/api/courses/courses.js';
import Metatags from '/imports/utils/metatags.js';
import CssFromQuery from '/imports/ui/lib/css-from-query.js';

import '/imports/ui/components/loading/loading.js';

import './courselist-frame.html';

Template.frameCourselist.onCreated(function frameCourselistOnCreated() {
	Metatags.setCommonTags(mf('course.list.windowtitle', 'Courses'));

	this.query = Router.current().params.query;
	this.limit = new ReactiveVar(parseInt(this.query.count, 10) || 5);

	this.autorun(() => {
		const filter =
			Courses
			.Filtering()
			.read(this.query)
			.done();

		this.subscribe(
			'Courses.findFilter',
			filter.toParams(),
			this.limit.get() + 1
		);
	});

	this.subscribe('regions');
});

Template.frameCourselist.helpers({
	cssRules: () => new CssFromQuery(Template.instance().query).getCssRules(),
	ready: () => Template.instance().subscriptionsReady(),
	courses: () => (
		Courses.find({},
			{ sort: { 'time_lastedit': -1 }
			, limit: Template.instance().limit.get()
			}
		)
	),
	moreCourses() {
		const limit = Template.instance().limit.get();
		const courseCount =
			Courses
			.find({}, { limit: limit + 1 })
			.count();

		return courseCount > limit;
	}
});

Template.frameCourselist.events({
	'click #showMoreCourses'(event, instance) {
		const limit = instance.limit;
		limit.set(limit.get() + 5);
	}
});

Template.frameCourselistCourse.onCreated(function frameCourselistCourseOnCreated() {
	this.expanded = new ReactiveVar(false);
});

Template.frameCourselistCourse.helpers({
	allRegions: () => Session.get('region') == 'all',
	regionOf: course => Regions.findOne(course.region).name,
	expanded: () => Template.instance().expanded.get(),
	toggleIndicatorIcon() {
		return Template.instance().expanded.get() ? 'minus' : 'plus';
	}
});

Template.frameCourselistCourse.events({
	'click .js-toggle-course-details'(event, instance) {
		$(event.currentTarget).toggleClass('active');
		instance.expanded.set(!instance.expanded.get());
	}
});
