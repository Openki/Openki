function finderRoute(path) {
	return {
		path: path,
		template: 'find',
		data: function() {
			return this.params;
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

	var router = Router.current();
	Router.go(router.route.getName(), { _id: router.params._id }, options);

	return true;
};


Template.find.onCreated(function() {
	var instance = this;

	instance.showingFilters = new ReactiveVar(false);
	instance.categorySearchResults = new ReactiveVar(false);
	instance.coursesReady = new ReactiveVar(false); // Latch

	var filter = Filtering(CoursePredicates);
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var data = Template.currentData();
		var query = data.query || {};

		filter
			.clear()
			.read(query)
			.add('region', Session.get('region'))
			.done();
	});

	// When there are filters set, show the filtering pane
	for (var name in filter.toParams()) {
		if (hiddenFilters.indexOf(name) > -1) {
			instance.showingFilters.set(true);
		}
	}

	// Update whenever filter changes
	instance.autorun(function() {
		var filterQuery = filter.toQuery();
		var sub = subs.subscribe('coursesFind', filterQuery, 36, function() {
			instance.coursesReady.set(true);
		});

		// Workaround: Subscription manager does not call onReady when the sub
		// is cached and ready
		// https://github.com/kadirahq/subs-manager/issues/7
		Tracker.nonreactive(function() {
			if (sub.ready()) instance.coursesReady.set(true);
		});
	});

	// The event display reacts to changes in time as well
	instance.autorun(function() {
		var filterQuery = filter.toQuery();

		// Here we show events only when they're not attached to a course
		filterQuery.standalone = true;
		filterQuery.after = minuteTime.get();
		instance.subscribe('eventsFind', filterQuery, 10);
	});
});


Template.find.onRendered(function() {
	var currentPath = Router.current().route.path(this);
	$('a[href!="' + currentPath + '"].nav_link').removeClass('active');
	$('a[href="/"].nav_link').addClass('active');
	// this.$('#find').focus();    //-> conflict with opening keyboard on mobile
});

var updateCategorySearch = function(event, instance) {
	var query = instance.$('.-searchCategories').val();
	if (query == '') {
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
}

Template.find.events({
	'submit': updateUrl,
	'change .-searchField': updateUrl,
	'change .-filterToggle': function(event, instance) {
		instance.filter.add('upcomingEvent', instance.$('#hasUpcomingEvent').prop('checked'));
		instance.filter.add('needsHost', instance.$('#needsHost').prop('checked'));
		instance.filter.add('needsMentor', instance.$('#needsMentor').prop('checked'));
		instance.filter.done();
		updateUrl(event, instance);
	},

	'keyup .-searchInput': _.debounce(function(event, instance) {
		instance.filter.add('search', $('.-searchInput').val()).done();
		// we don't updateURL() here, only after the field loses focus
	}, 200),

	'click .-findButton': function(event, instance) {
		instance.filter.add('search', $('.-searchInput').val()).done();
		updateURL(event, instance);
	},


	'keyup .-searchCategories': _.debounce(updateCategorySearch, 100),

	'focus .-searchCategories': updateCategorySearch,

	'click .-showSubcategories': function(event, instance) {
		$(".-subcategory" + "." + this).toggle();
		$(".-showSubcategories." + this + " span").toggleClass('glyphicon-plus');
		$(".-showSubcategories." + this + " span").toggleClass('glyphicon-minus');
		event.stopPropagation();
	},

	'click .-category': function(event, instance) {
		instance.filter.add('categories', ""+this).done();
		updateUrl(event, instance);
		instance.showingFilters.set(true);
		instance.$('.-searchCategories').val('');
		updateCategorySearch(event, instance);
	},

	'click .-removeCategoryFilter': function(event, instance) {
		instance.filter.remove('categories', ''+this).done();
		updateUrl(event, instance);
		return false;
	},

	'click .show_subcategories': function(e, instance) {
		$(".subcategory" + "." + this).toggle(0);
		e.stopPropagation(); //makes dropdown menu stay open
	},

	'click .-showFilters': function(event, instance) {
		var showingFilters = !instance.showingFilters.get();
		instance.showingFilters.set(showingFilters);

		if (!showingFilters) {
			for (var i in hiddenFilters) instance.filter.disable(hiddenFilters[i]);
			instance.filter.done();
			updateUrl(event, instance);
		}
	},

	"click .-searchAllRegions": function(event, template){
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
		return eventsFind(filterQuery, 10);
	},

	'proposeNewBlurb': function() {
		var instance = Template.instance();
		var filter = instance.filter.toParams();
		return !instance.showingFilters.get() && filter.search;
	},

	'ready': function() {
		return Template.instance().coursesReady.get();
	},

	'allRegions': function() {
		return (Session.get('region') == 'all');
	}
});
