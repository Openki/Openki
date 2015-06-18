Router.map(function () {
	this.route('find', {
		path: '/find/:search?',
		template: 'find',
		subscriptions: function () {
			var region = Session.get('region')
			var filter = {}
			filter.hasUpcomingEvent = !!this.params.query.hasUpcomingEvent;
			if (this.params.query.category) {
				filter.categories = this.params.query.category.split(',');
			}
			return [
				Meteor.subscribe('coursesFind', region, this.params.search, filter),

				Meteor.subscribe('eventsFind', { query: this.params.search, standalone:true }, 10)
			];
		},
		data: function() {
			var region = Session.get('region')
			var filter = {};
			filter.hasUpcomingEvent = !!this.params.query.hasUpcomingEvent;
			if (this.params.query.category) {
				filter.categories = this.params.query.category.split(',');
			}
			return {
				filter: filter,
				query: this.params.search,
				results: coursesFind(region, this.params.search, filter),
				eventResults: eventsFind({ query: this.params.search, standalone: true }, 10)
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Find ' + this.params.search
		}
	})
})

var submitForm = function(event, template) {
	options = {}
	
	var queryParams = [];
	if ($("#hasUpcomingEvent")[0].checked) {
		queryParams.push("hasUpcomingEvent");
	}
	if (template.data.filter.categories) {
		queryParams.push('category='+template.data.filter.categories.join(','));
	}
	options.query = queryParams.join('&');

	Router.go('find', { search: $('#find').val().replace("/", " ")}, options )
	event.preventDefault();
	event.stopPropagation();
	return false; 
}

Template.find.events({
	'submit': submitForm,
	'change .search': submitForm,
	'keyup .search': _.debounce(submitForm, 300),
	//TEMPORARY EVENTS FOR NACHHALTIGKEITSWOCHE HEADER
	'click button.nw_close': function() { 
		Session.set('showHeader', "hideIt");
	},
	
	'click button.readmore': function() {
		if (Session.get('showInfo') != true) {
			Session.set('showInfo', true);
		}
		else Session.set('showInfo', false);
	},
	
	'click .category': function(event, template) {
		var cats = template.data.filter.categories || [];
		cats.push(""+this);
		template.data.filter.categories = _.uniq(cats);
		submitForm(event, template);
		return false;
	}
});

Template.find.helpers({
	'hasUpcomingEventsChecked': function() {
		if (this.filter.hasUpcomingEvent) return "checked";
	},
	
	'newCourse': function() {
		return {
			name: this.query,
			region: Session.get('region')
		}
	},
});

