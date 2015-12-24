Router.map(function () {
	this.route('kiosk', {
		path: '/kiosk/events',
		template: 'kioskEvents',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			var now = minuteTime.get(); // Time dependency so this will be reactively updated

			this.filter = Filtering(EventPredicates).read(this.params.query).done();
			Session.set('kioskFilter', this.filter.toParams());

			var queryFuture = this.filter.toParams();
			queryFuture.after = now;

			var queryOngoing= this.filter.toParams();
			queryOngoing.ongoing = now;

			return [
				Meteor.subscribe('eventsFind', queryFuture, 20),
				Meteor.subscribe('eventsFind', queryOngoing),
			];
		},
		subscriptions: function() {
			return	Meteor.subscribe('locationNames');
		},
		data: function() {
			var now = minuteTime.get();
			var tomorrow = new Date(now);
			tomorrow.setHours(tomorrow.getHours() + 24);
			tomorrow.setHours(0);

			var queryFuture = this.filter.toParams();
			queryFuture.after = tomorrow;

			var queryToday = this.filter.toParams();
			queryToday.after = now;
			queryToday.before = tomorrow;

			var queryNow = this.filter.toParams();
			queryNow.ongoing = now;

			var filterParams = this.filter.toParams();

			return {
				today: eventsFind(queryToday, 20),
				future: eventsFind(queryFuture, 10),
				now: eventsFind(queryNow),
				filter: filterParams
			};
		},
		onAfterAction: function() {
			this.timer = Meteor.setInterval(function() {
				Session.set('seconds', new Date);
			}, 1000);
			document.title = webpagename + ' Events'
		},
		unload: function() {
			Meteor.clearInterval(this.timer);
		}
	});
	this.route('kioskCalendar', {								///////// calendar /////////
		path: '/kiosk/calendar',
		template: 'calendar',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			var region = Session.get('region');
			if (region === 'all') region = false;
			return Meteor.subscribe('events', region);
		},
		data: function() {
			var today = new Date();
			return {
				calendar_eventlist:      Events.find({start: {$gte:today}},{sort: {start: 1}}),
				calendar_eventlist_past: Events.find({start: {$lt:today}},{sort: {start: -1}}),
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Kiosk-View'
		}
	});
});

Template.kioskLayout.helpers({
	showKioskCalendar: function() {
		var currentIsKiosk = Router.current().route.path();
		if (currentIsKiosk != "/kiosk/events") return true
	}
});

Template.kioskEvents.helpers({
	showTime: function() {
		Session.get('seconds');
		return moment().format('LTS');
	},
	showDate: function() {
		Session.get('seconds');
		return moment().format('LL');
	}
});

Template.locationDisplay.helpers({
	showLocation: function() {
		// The location is shown when we have a location name and the location is not used as a filter
		return this.location.name && !Router.current().params.query.location;
	}
});

Template.kioskEventOngoing.rendered = function() {
	this.$('.kiosk_event_home').dotdotdot({
		height: 30,
	});
	this.$('.ellipsis').dotdotdot({
		height: 90,
	});
};
Template.kioskEventToday.rendered = function() {
	this.$('.course_event_title').dotdotdot({
		height: 70,
	})
	this.$('.course_event_desc').dotdotdot({
		//
	});
	this.$('.kiosk_event_home').dotdotdot({
		height: 60,
	});
};
Template.kioskEventFuture.rendered = function() {
	this.$('.course_event_title').dotdotdot({
		height: 70,
	})
	this.$('.course_event_desc').dotdotdot({
		height: 20,
	});
	this.$('.kiosk_event_home').dotdotdot({
		height: 60,
	});
};


Template.kioskLink.helpers({
	link: function() {
		var filterParams = Session.get('kioskFilter');
		if (!filterParams) return;

		delete filterParams['region']; // HACK region is kept in the session (for bad reasons)
		var queryString = UrlTools.paramsToQueryString(filterParams);

		var options = {};
		if (queryString.length) {
			options.query = queryString;
		}

		return Router.url('kiosk', {}, options);
	},
});

Template.kioskLink.events({
	'click .-removeBackLink': function() {
		return Session.set('kioskFilter', false);
	}
});
