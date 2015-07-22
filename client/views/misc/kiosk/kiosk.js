Router.map(function () {
	this.route('kiosk', {
		path: '/kiosk/events/:location?/:room?',
		template: 'kioskEvents',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			var now = minuteTime.get(); // Time dependency so this will be reactively updated


			this.filter = Filtering(EventPredicates).read(this.params.query).done();

			var queryFuture = this.filter.toParams();
			queryFuture.after = now;

			var queryOngoing= this.filter.toParams();
			queryOngoing.ongoing = now;

			return [
				Meteor.subscribe('eventsFind', queryFuture, 20),
				Meteor.subscribe('eventsFind', queryOngoing),
			];
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

			return {
				today: eventsFind(queryToday, 20),
				future: eventsFind(queryFuture, 10),
				now: eventsFind(queryNow)
			};
		},
		onAfterAction: function() {
			document.title = webpagename + ' Events'
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
			document.title = webpagename + 'Calendar'
		}
	});
});

Template.kioskLayout.helpers({
	showKioskCalendar: function () {
		var currentIsKiosk = Router.current().route.path();
		if (currentIsKiosk != "/kiosk/events") return true
	}
});

Template.kioskEvent.rendered = function() {
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

Template.kioskEventOngoing.rendered = function() {
	this.$('.ellipsis').dotdotdot({
		height: 80,
	});
};
