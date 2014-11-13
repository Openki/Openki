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

var submitForm = function() {
	options = {}
	if ($("#hasUpcomingEvent")[0].checked) {
		options.query = "hasUpcomingEvent";
	}

	Router.go('find', { query: $('#find').val().replace("/", " ")}, options )
	event.preventDefault();
	event.stopPropagation();
	return false; 
}

Template.find.events({
	'submit': submitForm,
	'change': submitForm
});

Template.find.helpers({
	'hasUpcomingEventsChecked': function() {
		if (this.hasUpcomingEvent) return "checked";
	}
})