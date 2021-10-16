import $ from 'jquery';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';
import { CourseModel, Courses } from '/imports/api/courses/courses';
import * as Metatags from '/imports/utils/metatags';
import SortSpec from '/imports/utils/sort-spec';

import '/imports/ui/components/loading';

import './template.html';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'frameCourselistPage',
		unknown,
		{
			sort: string;
			limit: ReactiveVar<number>;
		}
	>;

	const template = Template.frameCourselistPage;

	template.onCreated(function () {
		Metatags.setCommonTags(i18n('course.list.windowtitle', 'Courses'));

		const query = Router.current().params.query;
		this.sort = query.sort;
		this.limit = new ReactiveVar(parseInt(query.count, 10) || 5);

		this.autorun(() => {
			const filter = Courses.Filtering().read(query).done();

			const filterQuery = filter.toQuery();

			// Show internal events only when a group is specified
			if (!filterQuery.group && filterQuery.internal === undefined) {
				filterQuery.internal = false;
			}

			const sorting = this.sort ? SortSpec.fromString(this.sort) : SortSpec.unordered();

			this.subscribe(
				'Courses.findFilter',
				filterQuery,
				this.limit.get() + 1,
				undefined,
				sorting.spec(),
			);
		});

		this.subscribe('Regions');
	});

	template.helpers({
		ready: () => Template.instance().subscriptionsReady(),
		courses: () =>
			Courses.find(
				{},
				{
					limit: Template.instance().limit.get(),
				},
			),
		moreCourses() {
			const limit = Template.instance().limit.get();
			const courseCount = Courses.find({}, { limit: limit + 1 }).count();

			return courseCount > limit;
		},
	});

	template.events({
		'click .js-show-more-courses'(_event, instance) {
			const { limit } = instance;
			limit.set(limit.get() + 5);
		},
	});
}

{
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
		allRegions: () => Session.equals('region', 'all'),
		regionOf: (course: CourseModel) => Regions.findOne(course.region)?.name,
		expanded: () => Template.instance().expanded.get(),
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
}
