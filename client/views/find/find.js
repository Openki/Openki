function finderRoute(path) {
	return {
		path: path,
		template: 'findWrap',
		data: function() {
			var query = this.params.query;

			// Add filter options for the homepage
			return _.extend(query, {
				internal: false,
				region: Session.get('region')
			});
		},
		onAfterAction: function() {
			var search = this.params.query.search;
			if (search) {
				document.title = webpagename + mf('find.windowtitle', {SEARCH: search}, 'Find "{SEARCH}"');
			} else {
				document.title = webpagename + mf('find.WhatLearn?');
			}
		}
	};
}

Router.map(function () {
	this.route('find', finderRoute('/find'));
	this.route('home', finderRoute('/'));
});

var hiddenFilters = ['upcomingEvent', 'needsHost', 'needsMentor', 'categories'];

Template.find.onCreated(function() {
	var instance = this;

	instance.showingFilters = new ReactiveVar(false);
	instance.categorySearch = new ReactiveVar('');
	instance.categorySearchResults = new ReactiveVar(categories);
	instance.courseLimit = new ReactiveVar(36);
	instance.coursesReady = new ReactiveVar(false); // Latch

	var filter = Filtering(CoursePredicates);
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

		subs.subscribe('coursesFind', filterQuery, limit, function() {
			instance.coursesReady.set(true);
		});

		var eventQuery = filter.toQuery();

		// We show events only when they're not attached to a course
		eventQuery.standalone = true;
		eventQuery.after = minuteTime.get();
		instance.subscribe('eventsFind', eventQuery, 12);
	});
});

Template.find.events({
	'change .js-search-field': updateUrl,

	'keyup .js-search-input': _.debounce(function(event, instance) {
		instance.filter.add('search', $('.js-search-input').val()).done();
		// we don't updateURL() here, only after the field loses focus
	}, 200),

	'click .js-find-btn': function(event, instance) {
		instance.filter.add('search', $('.js-search-input').val()).done();
		updateUrl(event, instance);
	},

	'mouseover .js-category-label': function() {
		courseFilterPreview(('.'+this), true, true);
	},

	'mouseout .js-category-label': function() {
		courseFilterPreview(('.'+this), false, true);
	},

	'mouseover .js-group-label': function() {
		courseFilterPreview(('.'+this), true, true);
	},

	'mouseout .js-group-label': function() {
		courseFilterPreview(('.'+this), false, true);
	},

	'click .js-category-label': function(event, instance) {
		instance.filter.add('categories', ""+this).done();
		instance.$('.js-search-categories').val('');
		updateCategorySearch(event, instance);
		updateUrl(event, instance);
		window.scrollTo(0, 0);
	},

	'click .js-group-label': function(event, instance) {
		window.scrollTo(0, 0);
	},

	'click .js-toggle-filter': function(event, instance) {
		var showingFilters = !instance.showingFilters.get();
		instance.showingFilters.set(showingFilters);

		if (!showingFilters) {
			for (var i in hiddenFilters) instance.filter.disable(hiddenFilters[i]);
			instance.filter.done();
			updateUrl(event, instance);
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
		var course = courseTemplate();
		course.name = instance.filter.get('search');
		return course;
	},

	'hasResults': function() {
		var filterQuery = Template.instance().filter.toQuery();
		var results = coursesFind(filterQuery, 1);

		return results.count() > 0;
	},

	'hasMore': function() {
		var instance = Template.instance();
		if (!instance.coursesReady.get()) return false;

		var filterQuery = instance.filter.toQuery();
		var limit = instance.courseLimit.get();
		var results = coursesFind(filterQuery, limit+1);

		return results.count() > limit;
	},

	'results': function() {
		var instance = Template.instance();
		var filterQuery = instance.filter.toQuery();

		return coursesFind(filterQuery, instance.courseLimit.get());
	},


	'eventResults': function() {
		var filterQuery = Template.instance().filter.toQuery();
		filterQuery.standalone = true;
		filterQuery.after = minuteTime.get();
		return eventsFind(filterQuery, 12);
	},

	'ready': function() {
		return Template.instance().coursesReady.get();
	},

	'filteredRegion': function() {
		return !!Template.instance().filter.get('region');
	},

	'activeFilters': function() {
		var activeFilters = Template.instance().filter;
		var filters = ['upcomingEvent', 'needsHost', 'needsMentor', 'categories'];
		for (var i = 0; i < filters.length; i++) {
			var isActive = !!activeFilters.get(filters[i]);
			if (isActive) return true;
		}
		return false;
	},

	'searchIsLimited': function() {
		var activeFilters = Template.instance().filter;
		var filters = ['upcomingEvent', 'needsHost', 'needsMentor', 'categories', 'region'];
		for (var i = 0; i < filters.length; i++) {
			var isActive = !!activeFilters.get(filters[i]);
			if (isActive) return true;
		}
		return false;
	},

	'isMobile': function() {
		var screenXS = SCSSVars.screenXS;
		return Session.get('viewportWidth') <= screenXS;
	}
});
