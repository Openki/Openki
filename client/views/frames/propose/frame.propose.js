import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('framePropose', {
		path: '/frame/propose',
		template: 'framePropose',
		layoutTemplate: 'frameLayout',
		waitOn: () => Meteor.subscribe('regions'),
		data: function() {
			const params = Filtering(CoursePredicates).read(this.params.query).done();
			const data = params.toParams();
			data.isFrame = true;
			return data;
		},
		onAfterAction() {
			Metatags.setCommonTags(
				mf('course.propose.windowtitle', 'Propose new course')
			);
		}
	});
});
