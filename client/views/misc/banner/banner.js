Router.map(function () {
	var locfilters = function(params) {
		var filter = {};
		if (params.location && params.location !== 'ALL') {
			filter.location = params.location;
		}
		if (params.room && params.room !== 'ALL') {
			filter.room = params.room;
		}
		return filter;
	}

	this.route('banner', {
		path: '/banner/events/:location?/:room?',
		template: 'bannerEvents',
		layoutTemplate: 'bannerLayout',
		waitOn: function () {
			var now = minuteTime.get();

			var future = locfilters(this.params);
			future.after = now;

			var limit = parseInt(this.params.query.count, 10) || 5;

			return Meteor.subscribe('eventsFind', future, limit);
		},

		data: function() {
			// REVIEW we always do the same things, subscribing in waitOn() then again find() in data().
			var now = minuteTime.get();

			var future = locfilters(this.params);
			future.after = now;

			var limit = parseInt(this.params.query.count, 10) || 5;

			return eventsFind(future, limit);
		},

		onAfterAction: function() {
			document.title = webpagename + ' Events';
			if (this.params.query.lg) {
				Session.set('locale', this.params.query.lg);
			}
		}
	});
});
