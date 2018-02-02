import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import Categories from '/imports/api/categories/categories.js';
import Courses from '/imports/api/courses/courses.js';
import CourseTemplate from '/imports/ui/lib/course-template.js';
import FilterPreview from '/imports/ui/lib/filter-preview.js';
import ScssVars from '/imports/ui/lib/scss-vars.js';
import UrlTools from '/imports/utils/url-tools.js';

import '/imports/ui/components/courses/list/course-list.js';
import '/imports/ui/components/courses/edit/course-edit.js';
import '/imports/ui/components/courses/filter/course-filter.js';
import '/imports/ui/components/loading/loading.js';

import './find.html';

var hiddenFilters = ['needsRole', 'categories'];
var filters = hiddenFilters.concat(['state']);

Template.find.onCreated(function() {
	var instance = this;

	// Reflect filter selection in URI
	// This creates a browser history entry so it is not done on every filter
	// change. For example, when the search-field receives keydowns, the filter
	// is updated but the change is not reflected in the URI.
	instance.updateUrl = function() {
		var filterParams = instance.filter.toParams();
		delete filterParams.region; // HACK region is kept in the session (for bad reasons)
		delete filterParams.internal;
		var queryString = UrlTools.paramsToQueryString(filterParams);

		var options = {};

		if (queryString.length) {
			options.query = queryString;
		}

		RouterAutoscroll.cancelNext();

		var router = Router.current();
		Router.go(router.route.getName(), { _id: router.params._id }, options);

		return true;
	};


	instance.updateCategorySearch = function(query) {
		instance.categorySearch.set(query);

		if (!query) {
			instance.categorySearchResults.set(Categories);
			return;
		}

		var lowQuery = query.toLowerCase();
		var results = {};
		for (var mainCategory in Categories) {
			if (mf('category.'+mainCategory).toLowerCase().indexOf(lowQuery) >= 0) {
				results[mainCategory] = [];
			}
			for (i = 0; i < Categories[mainCategory].length; i++) {
				var subCategory = Categories[mainCategory][i];
				if (mf('category.'+subCategory).toLowerCase().indexOf(lowQuery) >= 0) {
					if (results[mainCategory]) results[mainCategory].push(subCategory);
					else results[subCategory] = [];
				}
			}
		}
		instance.categorySearchResults.set(results);
	};

	instance.updateCategorySearchDebounced = _.debounce(instance.updateCategorySearch, 200);

	instance.showingFilters = new ReactiveVar(false);
	instance.categorySearch = new ReactiveVar('');
	instance.categorySearchResults = new ReactiveVar(Categories);
	instance.courseLimit = new ReactiveVar(36);
	instance.coursesReady = new ReactiveVar(false); // Latch

	var filter = Courses.Filtering();
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var query = Template.currentData();
		filter
			.clear()
			.read(query)
			.done();
	});

	// When there are filters set, show the filtering pane
	instance.autorun(function() {
		for (var name in filter.toParams()) {
			if (hiddenFilters.indexOf(name) > -1) {
				instance.showingFilters.set(true);
			}
		}
	});

	// Update whenever filter changes
	instance.autorun(function() {
		var filterQuery = filter.toQuery();
		instance.coursesReady.set(false);

		// Add one to the limit so we know there is more to show
		var limit = instance.courseLimit.get() + 1;

		instance.subscribe('Courses.findFilter', filterQuery, limit, function() {
			instance.coursesReady.set(true);
		});
	});
});

Template.find.events({
	'keyup .js-search-input': _.debounce(function(event, instance) {
		instance.filter.add('search', $('.js-search-input').val()).done();
		// we don't updateURL() here, only after the field loses focus
	}, 200),


	// Update the URI when the search-field was changed an loses focus
	'change .js-search-field': function(event, instance) {
		instance.updateUrl();
	},


	'click .js-find-btn': function(event, instance) {
		event.preventDefault();

		instance.filter.add('search', $('.js-search-input').val()).done();
		instance.updateUrl();
	},

	'mouseover .js-category-label': function(e, instance) {
		FilterPreview({
			property: 'category',
			id: this,
			activate: true,
			delayed: true,
			instance
		});
	},

	'mouseout .js-category-label': function(e, instance) {
		FilterPreview({
			property: 'category',
			id: this,
			activate: false,
			delayed: true,
			instance
		});
	},

	'mouseover .js-group-label, mouseout .js-group-label': function(e, instance) {
		FilterPreview({
			property: 'group',
			id: this,
			activate: e.type == 'mouseover',
			delayed: true,
			instance
		});
	},

	'click .js-category-label': function(event, instance) {
		instance.filter.add('categories', ""+this).done();
		instance.$('.js-search-categories').val('');
		instance.updateCategorySearch('');
		instance.updateUrl();
		window.scrollTo(0, 0);
	},

	'click .js-group-label': function(event, instance) {
		window.scrollTo(0, 0);
	},

	'click .js-toggle-filter': function(event, instance) {
		var showingFilters = !instance.showingFilters.get();
		instance.showingFilters.set(showingFilters);

		if (!showingFilters) {
			for (var i in filters) instance.filter.disable(filters[i]);
			instance.filter.done();
			instance.updateUrl();
		}
	},

	"click .js-all-regions-btn": function(event, instance){
		Session.set('region', 'all');
	},

	"click .js-more-courses": function(event, instance) {
		var courseLimit = instance.courseLimit;
		courseLimit.set(courseLimit.get() + 36);
	}
});

Template.find.helpers({
	'search': function() {
		return Template.instance().filter.get('search');
	},

	'showingFilters': function() {
		return Template.instance().showingFilters.get();
	},

	'newCourse': function() {
		var instance = Template.instance();
		var course = CourseTemplate();
		course.name = instance.filter.get('search');
		var groupId = instance.filter.get('group');
		if (groupId) {
			course.group = groupId;
		}
		return course;
	},

	'hasResults': function() {
		var filterQuery = Template.instance().filter.toQuery();
		var results = Courses.findFilter(filterQuery, 1);

		return results.count() > 0;
	},

	'hasMore': function() {
		var instance = Template.instance();
		if (!instance.coursesReady.get()) return false;

		var filterQuery = instance.filter.toQuery();
		var limit = instance.courseLimit.get();
		var results = Courses.findFilter(filterQuery, limit+1);

		return results.count() > limit;
	},

	'results': function() {
		var instance = Template.instance();
		var filterQuery = instance.filter.toQuery();

		return Courses.findFilter(filterQuery, instance.courseLimit.get());
	},

	'ready': function() {
		return Template.instance().coursesReady.get();
	},

	'filteredRegion': function() {
		return !!Template.instance().filter.get('region');
	},

	'activeFilters': function() {
		var activeFilters = Template.instance().filter;
		return _.any(hiddenFilters, function(filter) {
			return !!activeFilters.get(filter);
		});
	},

	'searchIsLimited': function() {
		var activeFilters = Template.instance().filter;
		var relevantFilters = hiddenFilters.slice(); // clone
		relevantFilters.push('region');
		return _.any(relevantFilters, function(filter) {
			return !!activeFilters.get(filter);
		});
	},

	'isMobile': function() {
		return Session.get('viewportWidth') <= ScssVars.screenXS;
	}
});
