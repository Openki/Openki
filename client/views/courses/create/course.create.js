import Metatags from '/imports/Metatags.js';

courseTemplate = function() {
	return {
		roles: ['host', 'mentor'],
		region: Session.get('region')
	};
};

Router.map(function () {
	this.route('proposeCourse', {
		path: 'courses/propose',
		template: 'proposeCourse',
		onAfterAction: function() {
			Metatags.setCommonTags(mf('course.propose.windowtitle', 'Propose new course'));
		},
		data: courseTemplate
	});
});
