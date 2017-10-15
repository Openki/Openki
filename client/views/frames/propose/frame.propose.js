import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('framePropose', {
		path: '/frame/propose',
		template: 'framePropose',
		layoutTemplate: 'frameLayout',
		waitOn: () => Meteor.subscribe('regions'),
		data: function() {
			// HACK: Fix up predicates for our use
			// They are not currently exported so we use
			// CoursePredicates.region instead of Predicates.id.
			const predicates =
				{ region: CoursePredicates.region
				, group: CoursePredicates.region
				};

			const params = Filtering(predicates).read(this.params.query).done();
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
