import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Courses } from '/imports/api/courses/courses';

import * as Metatags from '/imports/utils/metatags';
import { SortSpec } from '/imports/utils/sort-spec';

import './course';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'frameCourselistPage',
	unknown,
	{
		limit: ReactiveVar<number>;
	}
>;

const template = Template.frameCourselistPage;

template.onCreated(function () {
	const instance = this;

	instance.autorun(() => {
		Metatags.setCommonTags(i18n('course.list.windowtitle', 'Courses'));
	});

	const query = Router.current().params.query;
	const sort = query.sort;
	instance.limit = new ReactiveVar(parseInt(query.count || '', 10) || 5);

	instance.autorun(() => {
		const filter = Courses.Filtering().read(query).done();

		const filterQuery = filter.toQuery();

		// Show internal events only when a group is specified
		if (!filterQuery.group && filterQuery.internal === undefined) {
			filterQuery.internal = false;
		}

		const sorting = sort ? SortSpec.fromString(sort) : SortSpec.unordered();

		instance.subscribe(
			'Courses.findFilter',
			filterQuery,
			this.limit.get() + 1,
			undefined,
			sorting.spec(),
		);
	});

	instance.subscribe('Regions');
});

template.helpers({
	courses() {
		return Courses.find(
			{},
			{
				limit: Template.instance().limit.get(),
			},
		);
	},
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
