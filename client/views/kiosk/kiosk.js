Router.map(function () {
	this.route('kiosk', {
		path: '/kiosk/events/',
		template: 'kioskEvents',
		layoutTemplate: 'kiosk',
		waitOn: function () {
			Session.get('roughTime'); // Time dependency so this will be reactively updated
			// Backdate filter by an hour so that courses that just started are still visible
			// We would have to know the duration of events to improve on this
			var retardedTime = moment().subtract(1, 'hour').toDate();
console.log('krims', retardedTime);
			return Meteor.subscribe('eventsFind', retardedTime, 5);
		},
		data: function() {
			var lg = this.params.lg;
			if (!lg) lg = Session.get('lg');
			if (!lg) lg = 'en'; // We could do navigator.languages too

			// REVIEW we always do the same things, subscribing in waitOn() then again find() in data().
			Session.get('roughTime');
			var retardedTime = moment().subtract(1, 'hour').toDate();
			console.log('krams', retardedTime);
			return eventsFind(retardedTime, 5);
		},
		onAfterAction: function() {
			document.title = webpagename + ' Events'
		}
	});
});
