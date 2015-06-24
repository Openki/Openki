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
		subscriptions: function () {
			var region = Session.get('region')
			var filter = {}
			filter.hasUpcomingEvent = !!this.params.query.hasUpcomingEvent;
			return [
				Meteor.subscribe('coursesFind', region, this.params.search, filter, 36),
				Meteor.subscribe('eventsFind', { query: this.params.search, standalone:true, region: region }, 10)
			];
		},
		data: function() {
			var region = Session.get('region')
			var filter = {};
			filter.hasUpcomingEvent = !!this.params.query.hasUpcomingEvent;
			return {
				hasUpcomingEvent: filter.hasUpcomingEvent,
				query: this.params.search,
				results: coursesFind(region, this.params.search, filter, 36),
				eventResults: eventsFind({ query: this.params.search, standalone: true }, 10)
			}
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

var submitForm = function(event) {
	options = {}
	if ($("#hasUpcomingEvent")[0].checked) {
		options.query = "hasUpcomingEvent";
	}

	Router.go('find', { search: $('#find').val().replace("/", " ")}, options )
	event.preventDefault();
	event.stopPropagation();
	return false; 
}

Template.find.events({
	'submit': submitForm,
	'change .search': submitForm,
	'keyup .search': _.debounce(submitForm, 300),
	
	'click button.readmore': function() {
		if (Session.get('showInfo') != true) {
			Session.set('showInfo', true);
		}
		else Session.set('showInfo', false);
	}
});

Template.find.helpers({
	'hasUpcomingEventsChecked': function() {
		if (this.hasUpcomingEvent) return "checked";
	},
	
	'newCourse': function() {
		return {
			name: this.query,
			region: Session.get('region')
		}
	},
});

Template.find.rendered = function() {
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="' + currentPath + '"].nav_link').addClass('active');
}
