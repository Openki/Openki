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
		data: function() {
			return this.params;
		},
		onAfterAction: function() {
			document.title = webpagename + 'Find ' + this.params.search
		}
	};
}

Router.map(function () {
	this.route('find', finderRoute('/find/:search?'));
	this.route('home', finderRoute('/'));
});

var searchChanged = function(event, instance) {
	var queryParams = [];

	instance.hasUpcomingEvent.set(!!$("#hasUpcomingEvent")[0].checked);
	if (instance.hasUpcomingEvent.get()) {
		queryParams.push("hasUpcomingEvent");
	}

	var cats = instance.categories.get();
	if (cats.length) {
		queryParams.push('category='+cats.join(','));
	}

	options = {}
	if (queryParams.length) {
		options.query = queryParams.join('&');
	}

	Router.go('find', { search: $('.searchInput').val().replace("/", " ")}, options);
	event.preventDefault();
}

Template.find.events({
	'submit': searchChanged,
	'change .search': searchChanged,
	'keyup .searchInput': _.debounce(function(event, instance) {
		instance.search.set($('.searchInput').val());
	}, 200),

	'click .category': function(event, instance) {
		var cats = instance.categories.get();
		cats.push(""+this);
		instance.categories.set(_.uniq(cats));
		searchChanged(event, instance);
		return false;
	},

	'click .removeCategoryFilter': function(event, instance) {
		var cats = instance.categories.get();
		var remCat = ''+this; // comes in a s string object, coerce to string
		instance.categories.set(_.without(cats, remCat));
		searchChanged(event, instance);
		return false;
	},

	'click .show_subcategories': function(e, instance) {
		$(".subcategory" + "." + this).toggle(0);
		e.stopPropagation();
	},
});

var readFilter = function(instance) {
	var filter = {};
	if (instance.hasUpcomingEvent.get()) {
		filter.hasUpcomingEvent = true;
	}

	var categories = instance.categories.get();
	if (categories.length) {
		filter.categories = categories;
	}

	return filter;
}

Template.find.helpers({
	'search': function() {
		return Template.instance().search.get();
	},

	'hasUpcomingEventsChecked': function() {
		if (Template.instance().hasUpcomingEvent.get()) return true;
	},

	'newCourse': function() {
		var instance = Template.instance();
		return {
			name: instance.search.get(),
			region: Session.get('region')
		}
	},

	'categories': function() {
		return Template.instance().categories.get();
	},

	'availableCategories': function() {
		return Object.keys(categories);
	},

	'availableSubcategories': function(category) {
		return categories[category];
	},

	'results': function() {
		var instance = Template.instance();

		// Wonky: We should use readFilter() here, like the template
		// subscriptions do. But if we do that the hasUpcomingEvents filter
		// will exclude all courses because they don't have their event loaded
		// yet, their template will do that.
		var filter = {};

		return coursesFind(Session.get('region'), instance.search.get(), filter, 36);
	},

	'eventResults': function() {
		return eventsFind({ query: Template.instance().search.get(), standalone: true }, 10);
	},

	'ready': function() {
		return Template.instance().subscriptionsReady();
	}
});

Template.find.onCreated(function() {
	var instance = this;

	// The page tracks two types of state
	// One is the state of the reactive instance vars which change page
	// content but not URL. The other type is modification of the URL which
	// is fed back onto the instance vars.
	instance.search = new ReactiveVar('');
	instance.hasUpcomingEvent = new ReactiveVar(false);
	instance.categories = new ReactiveVar([]);

	// Read URL state
	instance.autorun(function() {
		var data = Template.currentData();
		var query = data.query || {};

		instance.search.set(data.search ? data.search : '');
		instance.hasUpcomingEvent.set(!!(query.hasUpcomingEvent));
		instance.categories.set(query.category ? query.category.split(',') : []);
	});

	// Keep old subscriptions around until the new ones are ready
	// This avoids courses blinking out and back when we renew the subscriptions
	instance.courseSub = false;
	instance.eventSub = false;
	var oldSubs = [];
	var stopOldSubs = function() {
		if (instance.courseSub.ready() && instance.eventSub.ready()) {
			_.map(oldSubs, function(sub) { sub.stop() });
			oldSubs = [];
		}
	}

	// Update whenever instance vars change
	instance.autorun(function() {
		var search = instance.search.get();
		var region = Session.get('region');

		if (instance.courseSub) oldSubs.push(instance.courseSub);
		instance.courseSub = instance.subscribe('coursesFind', region, search, readFilter(instance), 36, stopOldSubs)

		if (instance.eventSub) oldSubs.push(instance.eventSub);
		instance.eventSub = instance.subscribe('eventsFind', { query: search, standalone: true, region: region }, 10, stopOldSubs);
	});
});

Template.find.rendered = function() {
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="/"].nav_link').addClass('active');
}
