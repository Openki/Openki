Router.map(function () {
	this.route('banner', {
		path: '/banner/events/:location?/:room?',
		template: 'bannerEvents',
		layoutTemplate: 'bannerLayout',
		waitOn: function () {
			Session.get('roughTime'); // Time dependency so this will be reactively updated
			// The haphazard type mangling is due to moment() being reactive when initialized with current date (really??) so converting the current date to a string then reading that was the quickest workaround I could think of :-D
			var endtime = moment(''+new Date()).toDate();

			var limit = parseInt(this.params.query.count, 10) || 5;
			if (this.params.location == 'All') this.params.location = undefined;
			if (this.params.room == 'All') this.params.room = undefined;
			return Meteor.subscribe('eventsFind', endtime, limit*2, this.params.location, this.params.room);
		},
		data: function() {
			var lg = this.params.lg;
			if (!lg) lg = Session.get('lg');
			if (!lg) lg = 'en'; // We could do navigator.languages too
			
			Session.get('fineTime');
			// REVIEW we always do the same things, subscribing in waitOn() then again find() in data().
			var endtime = moment(''+new Date()).toDate();
			var limit = parseInt(this.params.query.count, 10) || 5;
			if (this.params.location == 'All') this.params.location = undefined;
			if (this.params.room == 'All') this.params.room = undefined;
			return eventsFind(endtime, limit, this.params.location, this.params.room);
		},
		onAfterAction: function() {
			document.title = webpagename + ' Events';
			if (this.params.query.lg) {
				Session.set('locale', this.params.query.lg);
			}
		}
	});
});
