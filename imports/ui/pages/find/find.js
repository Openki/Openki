import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import Categories from '/imports/api/categories/categories';
import Courses from '/imports/api/courses/courses';
import CourseTemplate from '/imports/ui/lib/course-template';
import FilterPreview from '/imports/ui/lib/filter-preview';
import ScssVars from '/imports/ui/lib/scss-vars';
import UrlTools from '/imports/utils/url-tools';

import '/imports/ui/components/courses/list/course-list';
import '/imports/ui/components/courses/edit/course-edit';
import '/imports/ui/components/courses/filter/course-filter';
import '/imports/ui/components/loading/loading';

import './find.html';

const hiddenFilters = ['needsRole', 'categories'];
const filters = hiddenFilters.concat(['state']);

Template.find.onCreated(function () {
	const instance = this;

	// Reflect filter selection in URI
	// This creates a browser history entry so it is not done on every filter
	// change. For example, when the search-field receives keydowns, the filter
	// is updated but the change is not reflected in the URI.
	instance.updateUrl = function () {
		const urlParams = instance.filter.toParams();
		delete urlParams.region; // HACK region is kept in the session (for bad reasons)
		delete urlParams.internal;

		// used to keep scrollpos when navigating back
		if (instance.courseLimit.get() > instance.courseBlockSize) {
			urlParams.coursesAmount = instance.courseLimit.get();
		}
		const queryString = UrlTools.paramsToQueryString(urlParams);

		const options = {};

		if (queryString.length) {
			options.query = queryString;
		}

		RouterAutoscroll.cancelNext();

		const router = Router.current();
		Router.go(router.route.getName(), { _id: router.params._id }, options);

		return true;
	};

	instance.updateCategorySearch = function (query) {
		instance.categorySearch.set(query);

		if (!query) {
			instance.categorySearchResults.set(Categories);
			return;
		}

		const queryToLowerCase = query.toLowerCase();
		const results = {};

		Object.keys(Categories).forEach((mainCategory) => {
			if (mf(`category.${mainCategory}`).toLowerCase().includes(queryToLowerCase)) {
				results[mainCategory] = [];
			}
			Categories[mainCategory].forEach((subCategory) => {
				if (mf(`category.${subCategory}`).toLowerCase().includes(queryToLowerCase)) {
					if (results[mainCategory]) results[mainCategory].push(subCategory);
					else results[subCategory] = [];
				}
			});
		});
		instance.categorySearchResults.set(results);
	};

	instance.updateCategorySearchDebounced = _.debounce(instance.updateCategorySearch, 200);

	instance.showingFilters = new ReactiveVar(false);
	instance.categorySearch = new ReactiveVar('');
	instance.categorySearchResults = new ReactiveVar(Categories);
	instance.courseBlockSize = 36;
	instance.courseLimit = new ReactiveVar(instance.courseBlockSize);
	instance.coursesReady = new ReactiveVar(false); // Latch

	const filter = Courses.Filtering();
	instance.filter = filter;

	// Read URL state
	instance.autorun(() => {
		const query = Template.currentData();

		filter
			.clear()
			.read(query)
			.done();

		if (query.coursesAmount) {
			const coursesAmount = parseInt(query.coursesAmount, 10);
			if (coursesAmount > instance.courseBlockSize) {
				instance.courseLimit.set(coursesAmount);
			}
		} else {
			instance.courseLimit.set(instance.courseBlockSize);
		}
	});

	// When there are filters set, show the filtering pane
	instance.autorun(() => {
		// eslint-disable-next-line no-restricted-syntax
		for (const name in filter.toParams()) {
			if (hiddenFilters.indexOf(name) > -1) {
				instance.showingFilters.set(true);
			}
		}
	});

	// Update whenever filter changes
	instance.autorun(() => {
		const filterQuery = filter.toQuery();
		instance.coursesReady.set(false);

		// Add one to the limit so we know there is more to show
		const limit = instance.courseLimit.get() + 1;

		instance.subscribe('Courses.findFilter', filterQuery, limit, () => {
			instance.coursesReady.set(true);
		});
	});
});

Template.find.events({
	'keyup .js-search-input': _.debounce((event, instance) => {
		instance.filter.add('search', $('.js-search-input').val()).done();
		// we don't updateURL() here, only after the field loses focus
	}, 200),


	// Update the URI when the search-field was changed an loses focus
	'change .js-search-field'(event, instance) {
		instance.updateUrl();
	},


	'click .js-find-btn'(event, instance) {
		event.preventDefault();

		instance.filter.add('search', $('.js-search-input').val()).done();
		instance.updateUrl();
	},

	'mouseover .js-category-label'(e, instance) {
		FilterPreview({
			property: 'category',
			id: this,
			activate: true,
			delayed: true,
			instance,
		});
	},

	'mouseout .js-category-label'(e, instance) {
		FilterPreview({
			property: 'category',
			id: this,
			activate: false,
			delayed: true,
			instance,
		});
	},

	'mouseover .js-group-label, mouseout .js-group-label'(e, instance) {
		FilterPreview({
			property: 'group',
			id: this,
			activate: e.type === 'mouseover',
			delayed: true,
			instance,
		});
	},

	'click .js-category-label'(event, instance) {
		instance.filter.add('categories', `${this}`).done();
		instance.$('.js-search-categories').val('');
		instance.updateCategorySearch('');
		instance.updateUrl();
		window.scrollTo(0, 0);
	},

	'click .js-group-label'() {
		window.scrollTo(0, 0);
	},

	'click .js-toggle-filter'(event, instance) {
		const showingFilters = !instance.showingFilters.get();
		instance.showingFilters.set(showingFilters);

		if (!showingFilters) {
			filters.forEach(filter => instance.filter.disable(filter));
			instance.filter.done();
			instance.updateUrl();
		}
	},

	'click .js-all-regions-btn'() {
		Session.set('region', 'all');
	},

	'click .js-more-courses'(event, instance) {
		const { courseLimit } = instance;
		courseLimit.set(courseLimit.get() + instance.courseBlockSize);
		instance.updateUrl();
	},
});

Template.find.helpers({
	search() {
		return Template.instance().filter.get('search');
	},

	showingFilters() {
		return Template.instance().showingFilters.get();
	},

	newCourse() {
		const instance = Template.instance();
		const course = CourseTemplate();
		course.name = instance.filter.get('search');
		const groupId = instance.filter.get('group');
		if (groupId) {
			course.group = groupId;
		}
		return course;
	},

	hasResults() {
		const filterQuery = Template.instance().filter.toQuery();
		const results = Courses.findFilter(filterQuery, 1);

		return results.count() > 0;
	},

	hasMore() {
		const instance = Template.instance();
		if (!instance.coursesReady.get()) return false;

		const filterQuery = instance.filter.toQuery();
		const limit = instance.courseLimit.get();
		const results = Courses.findFilter(filterQuery, limit + 1);

		return results.count() > limit;
	},

	results() {
		const instance = Template.instance();
		const filterQuery = instance.filter.toQuery();

		return Courses.findFilter(filterQuery, instance.courseLimit.get());
	},

	ready() {
		return Template.instance().coursesReady.get();
	},

	filteredRegion() {
		return !!Template.instance().filter.get('region');
	},

	activeFilters() {
		const activeFilters = Template.instance().filter;
		return _.any(hiddenFilters, filter => !!activeFilters.get(filter));
	},

	searchIsLimited() {
		const activeFilters = Template.instance().filter;
		const relevantFilters = hiddenFilters.slice(); // clone
		relevantFilters.push('region');
		return _.any(relevantFilters, filter => !!activeFilters.get(filter));
	},

	isMobile() {
		return Session.get('viewportWidth') <= ScssVars.screenXS;
	},
});
