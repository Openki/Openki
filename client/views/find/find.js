Router.map(function () {
	this.route('find', {
		path: '/find/:search?',
		template: 'find',
		waitOn: function () {
			var region = Session.get('region')
			var filter = {}
			if (this.params.hasUpcomingEvent) filter.hasUpcomingEvent = true;
			return Meteor.subscribe('coursesFind', region, this.params.search, filter);
		},
		data: function() {
			var region = Session.get('region')
			var filter = {}
			if (this.params.hasUpcomingEvent) filter.hasUpcomingEvent = true;
			return {
				hasUpcomingEvent: this.params.hasUpcomingEvent,
				query: this.params.search,
				results: coursesFind(region, this.params.search, filter)
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Find ' + this.params.search
		}
	})
})

var submitForm = function(event) {
	options = {}
	if ($("#hasUpcomingEvent")[0].checked) {
		options.query = "hasUpcomingEvent";
	}

	Router.go('find', { search: $('#find').val().replace("/", " ")}, options )
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