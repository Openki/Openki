Router.map(function () {
	this.route('kiosk', {
		path: '/kiosk/events/:location?/:room?',
		template: 'kioskEvents',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			var now = minuteTime.get(); // Time dependency so this will be reactively updated

			return [
				Meteor.subscribe('eventsFind', { after: now, location: this.params.location, room: this.params.room }, 10),
				Meteor.subscribe('eventsFind', { ongoing: now, location: this.params.location, room: this.params.room }),
			];
		},
		data: function() {
			var now = minuteTime.get();
			// REVIEW we always do the same things, subscribing in waitOn() then again find() in data().

			return {
				future: eventsFind({ after: now, location: this.params.location, room: this.params.room }, 10),
				present: eventsFind({ ongoing: now, location: this.params.location, room: this.params.room })
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
				calendar_eventlist:      Events.find({startdate: {$gte:today}},{sort: {startdate: 1}}),
				calendar_eventlist_past: Events.find({startdate: {$lt:today}},{sort: {startdate: -1}}),
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