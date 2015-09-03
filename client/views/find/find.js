function finderRoute(path) {
	return {
		path: path,
		template: 'find',
		onBeforeAction: function() {
			// Allow setting the region in the URL by parameter '?region=Testistan'
			if (this.params.query.region) {
				var region = Regions.findOne({ name: this.params.query.region })
				if (region) Session.set('region', region._id);
			};
			this.next();
		},
		subscriptions: function() {
			return	Meteor.subscribe('locationNames', Session.get('region'));
		},
		data: function() {
			return this.params;
		},
		onAfterAction: function() {
			var search = this.params.query.search
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

var hiddenFilters = ['upcomingEvent', 'needsHost', 'needsMentor', 'group', 'categories'];

var updateUrl = function(event, instance) {
	event.preventDefault();

	var filterParams = instance.filter.toParams();
	delete filterParams['region']; // HACK region is kept in the session (for bad reasons)
	var queryString = UrlTools.paramsToQueryString(filterParams);

	var options = {};
	if (queryString.length) {
		options.query = queryString;
	}
	Router.go('find', {}, options);

	return true;
}

Template.find.events({
	'submit': updateUrl,
	'change .search_field': updateUrl,
	'change .filterToggle': function(event, instance) {
		instance.filter.add('upcomingEvent', instance.$('#hasUpcomingEvent').prop('checked'));
		instance.filter.add('needsHost', instance.$('#needsHost').prop('checked'));
		instance.filter.add('needsMentor', instance.$('#needsMentor').prop('checked'));
		instance.filter.done();
		updateUrl(event, instance);
	},

	'keyup .searchInput': _.debounce(function(event, instance) {
		instance.filter.add('search', $('.searchInput').val()).done();
		// we don't updateURL() here, only after the field loses focus
	}, 200),

	'click .category': function(event, instance) {
		instance.filter.add('categories', ""+this).done();
		updateUrl(event, instance);
		$('#categories_dropdown').dropdown('toggle');
		return false;
	},

	'click .removeCategoryFilter': function(event, instance) {
		instance.filter.remove('categories', ''+this).done();
		updateUrl(event, instance);
		return false;
	},

	'click .show_subcategories': function(e, instance) {
		$(".subcategory" + "." + this).toggle(0);
		e.stopPropagation(); //makes dropdown menu stay open
	},

	'click .group': function(event, instance) {
		instance.filter.add('group', ""+this).done();
		updateUrl(event, instance);
		if (!instance.showingFilters.get()) instance.showingFilters.set(true);
		window.scrollTo(0, 0);
		return false;
	},

	'click .removeGroupFilter': function(event, instance) {
		instance.filter.remove('group', ''+this._id).done();
		updateUrl(event, instance);
		return false;
	},

	'click .filter-toggle-btn': function(event, instance) {
		var showingFilters = !instance.showingFilters.get();
		instance.showingFilters.set(showingFilters);

		if (!showingFilters) {
			for (i in hiddenFilters) instance.filter.disable(hiddenFilters[i]);
			instance.filter.done();
			updateUrl(event, instance);
		}
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
		return {
			name: instance.filter.get('search'),
			region: Session.get('region')
		}
	},

	'categories': function() {
		return Template.instance().filter.get('categories');
	},

	'group': function() {
		var groupId = Template.instance().filter.get('group');
		if (!groupId) return false;
		return Groups.findOne(groupId);
	},

	'availableCategories': function() {
		return Object.keys(categories);
	},

	'availableSubcategories': function(category) {
		return categories[category];
	},

	'availableGroups': function(group) {
		return groups[group];
	},

	'results': function() {
		var filterQuery = Template.instance().filter.toQuery();

		// Wonky: Clear the predicate that filters for upcoming events only
		// Leaving the filter would exclude all courses because they don't
		// have their event loaded yet, their template will do that.
		// Here we rely on the filtering done server-side, and that no other
		// subscirption loads courses.
		// There are ways to do this properly...
		delete filterQuery.upcomingEvent;

		return coursesFind(filterQuery, 36);
	},

	'eventResults': function() {
		var filterQuery = Template.instance().filter.toQuery();
		filterQuery.standalone = true;
		return eventsFind(filterQuery, 10);
	},

	'ready': function() {
		return Template.instance().subscriptionsReady();
	}
});

Template.find.onCreated(function() {
	var instance = this;

	instance.showingFilters = new ReactiveVar(false);

	var filter = Filtering(CoursePredicates);
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var data = Template.currentData();
		var query = data.query || {};

		filter
			.clear()
			.add('region', Session.get('region'))
			.read(query)
			.done();
	});

	// When there are filters set, show the filtering pane
	for (name in filter.toParams()) {
		if (hiddenFilters.indexOf(name) > -1) {
			instance.showingFilters.set(true);
		}
	}

	// Keep old subscriptions around until the new ones are ready
	// This avoids courses blinking out and back when we renew the subscriptions
	var courseSub = false;
	var eventSub = false;
	var oldSubs = [];
	var stopOldSubs = function() {
		if (courseSub.ready() && eventSub.ready()) {
			_.map(oldSubs, function(sub) { sub.stop() });
			oldSubs = [];
		}
	}

	// Update whenever instance vars change
	instance.autorun(function() {
		var filterQuery = filter.toQuery();

		if (courseSub) oldSubs.push(courseSub);
		courseSub = instance.subscribe('coursesFind', filterQuery, 36, stopOldSubs)

		// Here we show events only when they're not attached to a course
		filterQuery.standalone = true;
		if (eventSub) oldSubs.push(eventSub);
		eventSub = instance.subscribe('eventsFind', filterQuery, 10, stopOldSubs);
	});
});

Template.find.rendered = function() {
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="/"].nav_link').addClass('active');
}
