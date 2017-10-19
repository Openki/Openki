import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('kioskEvents', {
		path: '/kiosk/events',
		layoutTemplate: 'kioskLayout',
		waitOn: function () {
			var now = minuteTime.get(); // Time dependency so this will be reactively updated

			this.filter = Events.Filtering().read(this.params.query).done();
			Session.set('kioskFilter', this.filter.toParams());

			var queryFuture = this.filter.toParams();
			queryFuture.after = now;

			var queryOngoing= this.filter.toParams();
			queryOngoing.ongoing = now;

			return [
				subs.subscribe('Events.findFilter', queryFuture, 20),
				subs.subscribe('Events.findFilter', queryOngoing),
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

			var filterParams = this.filter.toParams();

			return {
				today: Events.findFilter(queryToday, 20),
				future: Events.findFilter(queryFuture, 10),
				now: Events.findFilter(queryNow),
				filter: filterParams
			};
		},
		onAfterAction: function() {
			this.timer = Meteor.setInterval(function() {
				Session.set('seconds', new Date());
			}, 1000);
			Metatags.setCommonTags(mf('event.list.windowtitle', 'Events'));
		},
		unload: function() {
			Meteor.clearInterval(this.timer);
		}
	});
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
