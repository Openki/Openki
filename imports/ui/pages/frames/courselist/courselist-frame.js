import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { mf } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';
import { Courses } from '/imports/api/courses/courses';
import * as Metatags from '/imports/utils/metatags';

import '/imports/ui/components/loading/loading';

import './courselist-frame.html';
import SortSpec from '/imports/utils/sort-spec';

Template.frameCourselist.onCreated(function frameCourselistOnCreated() {
	Metatags.setCommonTags(mf('course.list.windowtitle', 'Courses'));

	this.query = Router.current().params.query;
	this.sort = Router.current().params.query.sort;
	this.limit = new ReactiveVar(parseInt(this.query.count, 10) || 5);

	this.autorun(() => {
		const filter = Courses
			.Filtering()
			.read(this.query)
			.done();

		const sorting = this.sort ? SortSpec.fromString(this.sort) : SortSpec.unordered();

		this.subscribe(
			'Courses.findFilter',
			filter.toParams(),
			this.limit.get() + 1,
			sorting.spec(),
		);
	});

	this.subscribe('Regions');
});

Template.frameCourselist.helpers({
	ready: () => Template.instance().subscriptionsReady(),
	courses: () => Courses.find({},
		{
			limit: Template.instance().limit.get(),
		}),
	moreCourses() {
		const limit = Template.instance().limit.get();
		const courseCount = Courses
			.find({}, { limit: limit + 1 })
			.count();

		return courseCount > limit;
	},
});

Template.frameCourselist.events({
	'click .js-show-more-courses'(event, instance) {
		const { limit } = instance;
		limit.set(limit.get() + 5);
	},
});

Template.frameCourselistCourse.onCreated(function frameCourselistCourseOnCreated() {
	this.expanded = new ReactiveVar(false);
});

Template.frameCourselistCourse.helpers({
	allRegions: () => Session.equals('region', 'all'),
	regionOf: (course) => Regions.findOne(course.region).name,
	expanded: () => Template.instance().expanded.get(),
	toggleIndicatorIcon() {
		return Template.instance().expanded.get() ? 'angle-up' : 'angle-down';
	},
	interestedPersons() {
		return this.members.length;
	},
});

Template.frameCourselistCourse.events({
	'click .js-toggle-course-details'(event, instance) {
		$(event.currentTarget).toggleClass('active');
		instance.expanded.set(!instance.expanded.get());
	},
});
