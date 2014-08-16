
Router.map(function () {
	this.route('find', {
		path: '/find/:query?',
		template: 'find',
		waitOn: function () {
			return Meteor.subscribe('coursesFind', this.params.query);
		},
		data: function() {
			return {
				query: this.params.query,
				results: Courses.find()
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Find ' + this.params.query
		}
	})
})


Template.find.events({
	'submit': function(event) {
		Router.go('find', { query: $('#find').val() })
		event.preventDefault();
		event.stopPropagation();
		return false; 
	}
});
