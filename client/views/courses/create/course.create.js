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
			document.title = webpagename + 'Propose new course';
		},
		data: courseTemplate
	});
});
