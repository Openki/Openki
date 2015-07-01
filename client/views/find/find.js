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
			return this.params.query;
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
	'click button.readmore': function() {
		if (Session.get('showInfo') != true) {
			Session.set('showInfo', true);
		}
		else Session.set('showInfo', false);
	},
	'submit': searchChanged,
	'change .search': searchChanged,
	'keyup .searchInput': _.debounce(function(event, instance) {
		instance.search.set($('.searchInput').val());
	}, 300),
	
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
		submitForm(event, instance);
		return false;
	}
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
	'hasUpcomingEventsChecked': function() {
		if (Template.instance().hasUpcomingEvent.get()) return "checked";
		return "";
	},
	
	'newCourse': function() {
		return {
			name: this.query,
			region: Session.get('region')
		}
	},

	'categories': function() {
		return Template.instance().categories.get();
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
		var instance = Template.instance();
		return instance.subs[0] && instance.subs[0][0].ready() && instance.subs[0][1].ready();
	}
});

Template.find.onCreated(function() {
	var instance = this;

	var search = instance.data.search ? instance.data.search : '';
	instance.search = new ReactiveVar(search);

	var hasUpcomingEvent = !!instance.data.hasUpcomingEvent;
	instance.hasUpcomingEvent = new ReactiveVar(hasUpcomingEvent);


	var categories = instance.data.category ? instance.data.category.split(',') : [];
	instance.categories = new ReactiveVar(categories);

	// Keep two sets of course/event subscriptions around.
	// This way, the search results don't blink out and back when we switch
	// subscriptions
	instance.subs = [];

	instance.autorun(function() {
		var search = instance.search.get();
		var region = Session.get('region');

		// Stop the penultimate subscriptions
		if (instance.subs.length > 1) _.map(instance.subs.pop(), function(sub) { sub.stop() });

		instance.subs.unshift([
			instance.subscribe('coursesFind', region, search, readFilter(instance), 36),
			instance.subscribe('eventsFind', { query: search, standalone: true, region: region }, 10)
		]);
	});
});

Template.find.rendered = function() {
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="/"].nav_link').addClass('active');
}
