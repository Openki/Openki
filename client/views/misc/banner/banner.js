Router.map(function () {
	this.route('banner', {
		path: '/banner/events',
		template: 'bannerEvents',
		layoutTemplate: 'bannerLayout',
		waitOn: function () {
			this.filter = Filtering(EventPredicates).read(this.params.query).done();

			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 5;

			return Meteor.subscribe('eventsFind', filterParams, limit);
		},

		data: function() {
			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 5;

			return eventsFind(filterParams, limit);
		},

		onAfterAction: function() {
			document.title = webpagename + ' Events';
			if (this.params.query.lg) {
				Session.set('locale', this.params.query.lg);
			}
		}
	});
});
