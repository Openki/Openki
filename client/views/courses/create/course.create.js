courseTemplate = function() {
	return {
		roles: ['host', 'mentor'],
		region: Session.get('region')
	};
};

Router.map(function () {
	this.route('proposeCourse', {
		path: 'courses/propose',
		template: 'proposecourse',
		onAfterAction: function() {
			document.title = webpagename + 'Propose new course';
		},
		data: courseTemplate
	});
});



Template.proposecourse.rendered = function () {
	var currentPath = Router.current().route.path(this);
	$('a[href!="' + currentPath + '"].navbar-link').removeClass('navbar-link-active');
	$('a[href="' + currentPath + '"].navbar-link').addClass('navbar-link-active');
};
