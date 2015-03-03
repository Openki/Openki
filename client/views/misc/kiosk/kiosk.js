Router.map(function () {
	this.route('kiosk', {
		path: '/kiosk/events/:location?/:room?',
		template: 'kioskEvents',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			Session.get('roughTime'); // Time dependency so this will be reactively updated
			// The haphazard type mangling is due to moment() being reactive when initialized with current date (really??) so converting the current date to a string then reading that was the quickest workaround I could think of :-D
			var endtime = moment(''+new Date()).toDate();

			return Meteor.subscribe('eventsFind', endtime, 10, this.params.location, this.params.room);
		},
		data: function() {
			var lg = this.params.lg;
			if (!lg) lg = Session.get('lg');
			if (!lg) lg = 'en'; // We could do navigator.languages too
			   
			Session.get('fineTime');
			// REVIEW we always do the same things, subscribing in waitOn() then again find() in data().
			var endtime = moment(''+new Date()).toDate();
			return eventsFind(endtime, 5, this.params.location, this.params.room);
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