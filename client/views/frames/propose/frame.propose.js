import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('framePropose', {
		path: '/frame/propose',
		template: 'courseEdit',
		layoutTemplate: 'frameLayout',
		waitOn: function () {
			this.filter = Filtering(EventPredicates).read(this.params.query).done();

			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 6;

			return Meteor.subscribe('eventsFind', filterParams, limit*2);
		},

		data: function() {
			regions = Regions.find();
			return regions;
		},

		onAfterAction: function() {
			Metatags.setCommonTags(mf('course.propose.windowtitle', 'Propose new course'));
		}
	});
});
