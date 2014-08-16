
Router.map(function () {
	this.route('find', {
		path: '/find/:query?',
		template: 'find',
		waitOn: function () {
			var region = Session.get('region')
			var filter = {}
			if (this.params.hasUpcomingEvent) filter.hasUpcomingEvent = true
			return Meteor.subscribe('coursesFind', region, this.params.query, filter);
		},
		data: function() {
			return {
				hasUpcomingEvent: this.params.hasUpcomingEvent,
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
	'submit': function() {
		Router.go('find', { query: $('#find').val()})
		event.preventDefault();
		event.stopPropagation();
		return false; 
	}
});

Template.find.hasUpcomingEventsChecked = function() {
	if (this.hasUpcomingEvent) return "checked";
}
