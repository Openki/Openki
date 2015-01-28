Router.map(function () {
	this.route('kiosk', {
		path: '/kiosk/events/',
		template: 'kioskEvents',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			Session.get('roughTime'); // Time dependency so this will be reactively updated
			// Backdate filter by an hour so that courses that just started are still visible
			// We would have to know the duration of events to improve on this
			// The haphazard type mangling is due to moment() being reactive when initialized with current date (really??) so converting the current date to a string then reading that was the quickest workaround I could think of (and I was offline) :-D
			var retardedTime = moment(''+new Date()).subtract(1, 'hour').toDate();

			return Meteor.subscribe('eventsFind', retardedTime, 10);
		},
		data: function() {
			var lg = this.params.lg;
			if (!lg) lg = Session.get('lg');
			if (!lg) lg = 'en'; // We could do navigator.languages too
			   
			Session.get('fineTime');
			// REVIEW we always do the same things, subscribing in waitOn() then again find() in data().
			var retardedTime = moment(''+new Date()).subtract(1, 'hour').toDate();
			return eventsFind(retardedTime, 5);
		},
		onAfterAction: function() {
			document.title = webpagename + ' Events'
		}
	});
});
