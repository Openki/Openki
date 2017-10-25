import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('frameEvents', {
		path: '/frame/events',
		template: 'frameEvents',
		layoutTemplate: 'frameLayout',
		waitOn: function () {
			this.filter = Events.Filtering().read(this.params.query).done();

			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 6;

			return Meteor.subscribe('Events.findFilter', filterParams, limit*2);
		},

		data: function() {
			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 6;

			return Events.findFilter(filterParams, limit);
		},

		onAfterAction: function() {
			Metatags.setCommonTags(mf('event.list.windowtitle', 'Events'));
		}
	});
});

Template.frameEvents.onRendered(function() {
	var instance = this;
	this.autorun(function() {
		instance.$("a").attr("target", "_blank");
	});
});
