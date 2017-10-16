import Metatags from '/imports/Metatags.js';
import '/imports/Predicates.js';

Router.map(function () {
	this.route('framePropose', {
		path: '/frame/propose',
		template: 'framePropose',
		layoutTemplate: 'frameLayout',
		waitOn: () => Meteor.subscribe('regions'),
		data: function() {
			const predicates =
				{ region: Predicates.id
				, group: Predicates.id
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
