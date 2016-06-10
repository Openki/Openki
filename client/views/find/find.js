function finderRoute(path) {
	return {
		path: path,
		template: 'findWrap',
		data: function() {
			var query = this.params.query;

			// Add filter options for the homepage
			return _.extend(query, {
				internal: false
			});
		},
		onAfterAction: function() {
			var search = this.params.query.search;
			if (search) {
				document.title = webpagename + mf('find.windowtitle', {SEARCH: search}, 'Find "{SEARCH}"');
			} else {
				document.title = webpagename + mf('startpage.windowtitle', 'What do you want to learn?');
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
	instance.categorySearchResults = new ReactiveVar(categories);
	instance.coursesReady = new ReactiveVar(false); // Latch

	var filter = Filtering(CoursePredicates);
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var query = Template.currentData();
		filter
			.clear()
			.read(query)
			.add('region', Session.get('region'))
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
		var sub = subs.subscribe('coursesFind', filterQuery, 36, function() {
			instance.coursesReady.set(true);
		});
	});

	// The event display reacts to changes in time as well
	instance.autorun(function() {
		var filterQuery = filter.toQuery();

		// Here we show events only when they're not attached to a course
		filterQuery.standalone = true;
		filterQuery.after = minuteTime.get();
		instance.subscribe('eventsFind', filterQuery, 12);
	});
});

var updateCategorySearch = function(event, instance) {
	var query = instance.$('.js-search-categories').val();
	if (query === '') {
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

var filterPreview = function(highlightClass, opacity) {
	$('.course').not(highlightClass).stop().fadeTo('slow', opacity);
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
		updateURL(event, instance);
	},

	'mouseover .js-filter-upcoming-events': function() {
		filterPreview('.hasupcomingevents', 0.33);
	},

	'mouseout .js-filter-upcoming-events': function() {
		filterPreview('.hasupcomingevents', 1);
	},

	'mouseover .js-filter-needs-host': function() {
		filterPreview('.needsHost', 0.33);
	},

	'mouseout .js-filter-needs-host': function() {
		filterPreview('.needsHost', 1);
	},

	'mouseover .js-filter-needs-mentor': function() {
		filterPreview('.needsMentor', 0.33);
	},

	'mouseout .js-filter-needs-mentor': function() {
		filterPreview('.needsMentor', 1);
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

	'click .js-category-label': function(event, instance) {
		instance.filter.add('categories', ""+this).done();
		instance.$('.js-search-categories').val('');
		updateCategorySearch(event, instance);
		updateUrl(event, instance);
	},

	'mouseover .js-category-label': function() {
		filterPreview(('.'+this), 0.33);
	},

	'mouseout .js-category-label': function() {
		filterPreview(('.'+this), 1);
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

	'mouseover .group': function() {
		filterPreview(('.'+this), 0.33);
	},

	'mouseout .group': function() {
		filterPreview(('.'+this), 1);
	},

	"click .js-all-regions-btn": function(event, template){
		Session.set('region', 'all');
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

	'availableGroups': function(group) {
		return groups[group];
	},

	'results': function() {
		var filterQuery = Template.instance().filter.toQuery();

		return coursesFind(filterQuery, 36);
	},

	'eventResults': function() {
		var filterQuery = Template.instance().filter.toQuery();
		filterQuery.standalone = true;
		filterQuery.after = minuteTime.get();
		return eventsFind(filterQuery, 12);
	},

	'proposeNewBlurb': function() {
		var instance = Template.instance();
		var filter = instance.filter.toParams();
		return !instance.showingFilters.get() && filter.search;
	},

	'ready': function() {
		return Template.instance().coursesReady.get();
	},

	'regionSelected': function() {
		return (Session.get('region') != 'all');
	},

	'isMobile': function() {
		return Session.get('screenSize') <= 480; // @screen-xs
	}
});
