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

var updateUrl = function(event, instance) {
	event.preventDefault();

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

var updateCategorySearch = function(event, instance) {
	var query = instance.$('.js-search-categories').val();
	instance.categorySearch.set(query);

	if (!query) {
		instance.categorySearchResults.set(categories);
		return;
	}

	var lowQuery = query.toLowerCase();
	var results = {};
	for (var mainCategory in categories) {
		if (mf('category.'+mainCategory).toLowerCase().indexOf(lowQuery) >= 0) {
			results[mainCategory] = [];
		}
		for (i = 0; i < categories[mainCategory].length; i++) {
			var subCategory = categories[mainCategory][i];
			if (mf('category.'+subCategory).toLowerCase().indexOf(lowQuery) >= 0) {
				if (results[mainCategory]) results[mainCategory].push(subCategory);
				else results[subCategory] = [];
			}
		}
	}
	instance.categorySearchResults.set(results);
};

Template.find.events({
	'submit': updateUrl,
	'change .js-search-field': updateUrl,
	'change .js-toggle-property-filter': function(event, instance) {
		instance.filter.add('upcomingEvent', instance.$('#hasUpcomingEvent').prop('checked'));
		instance.filter.add('needsHost', instance.$('#needsHost').prop('checked'));
		instance.filter.add('needsMentor', instance.$('#needsMentor').prop('checked'));
		instance.filter.done();
		updateUrl(event, instance);
	},

	'keyup .js-search-input': _.debounce(function(event, instance) {
		instance.filter.add('search', $('.js-search-input').val()).done();
		// we don't updateURL() here, only after the field loses focus
	}, 200),

	'click .js-find-btn': function(event, instance) {
		instance.filter.add('search', $('.js-search-input').val()).done();
		updateUrl(event, instance);
	},

	'mouseover .js-filter-upcoming-events': function() {
		courseFilterPreview('.has-upcoming-events', true, false);
	},

	'mouseout .js-filter-upcoming-events': function() {
		courseFilterPreview('.has-upcoming-events', false, false);
	},

	'mouseover .js-filter-needs-host': function() {
		courseFilterPreview('.needsHost', true, false);
	},

	'mouseout .js-filter-needs-host': function() {
		courseFilterPreview('.needsHost', false, false);
	},

	'mouseover .js-filter-needs-mentor': function() {
		courseFilterPreview('.needsMentor', true, false);
	},

	'mouseout .js-filter-needs-mentor': function() {
		courseFilterPreview('.needsMentor', false, false);
	},

	'mouseover .js-category-selection-label': function() {
		courseFilterPreview(('.'+this), true, false);
	},

	'mouseout .js-category-selection-label': function() {
		courseFilterPreview(('.'+this), false, false);
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

	'keyup .js-search-categories': _.debounce(updateCategorySearch, 100),

	'focus .js-search-categories': function(event, instance) {
		instance.$('.dropdown-toggle').dropdown('toggle');
	},

	'click .js-toggle-subcategories': function(event, instance) {
		$(".js-sub-category" + "." + this).toggle();
		$(".js-toggle-subcategories." + this + " span").toggleClass('fa-angle-down');
		$(".js-toggle-subcategories." + this + " span").toggleClass('fa-angle-up');
		event.stopPropagation();
	},

	'click .js-category-label, click .js-category-selection-label': function(event, instance) {
		instance.filter.add('categories', ""+this).done();
		instance.$('.js-search-categories').val('');
		updateCategorySearch(event, instance);
		updateUrl(event, instance);
		window.scrollTo(0, 0);
	},

	'click .js-group-label': function(event, instance) {
		window.scrollTo(0, 0);
	},

	'click .js-remove-category-btn': function(event, instance) {
		instance.filter.remove('categories', ''+this).done();
		updateUrl(event, instance);
		return false;
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

	'toggleChecked': function(name) {
		return Template.instance().filter.get(name) ? 'checked' : '';
	},

	'newCourse': function() {
		var instance = Template.instance();
		var course = courseTemplate();
		course.name = instance.filter.get('search');
		return course;
	},

	'categories': function() {
		return Template.instance().filter.get('categories');
	},

	'group': function() {
		var groupId = Template.instance().filter.get('group');
		if (!groupId) return false;
		return groupId;
	},

	'availableCategories': function() {
		return Object.keys(Template.instance().categorySearchResults.get('categorySearchResults'));
	},

	'availableSubcategories': function(mainCategory) {
		return Template.instance().categorySearchResults.get()[mainCategory];
	},

	'categoryNameMarked': function() {
		Session.get('locale'); // Reactive dependency
		var search = Template.instance().categorySearch.get();
		var name = mf('category.'+this);
		return markedName(search, name);
	},

	'availableGroups': function(group) {
		return groups[group];
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
		var viewportWidth = Session.get('viewportWidth');
		var screenXS = SCSSVars.screenXS;
		return Session.get('viewportWidth') <= screenXS;
	}
});
