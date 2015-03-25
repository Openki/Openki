Router.map(function () {
	this.route('calendar', {								///////// calendar /////////
		path: 'calendar',
		template: 'calendar',
		waitOn: function () {
			var region = Session.get('region');
			if (region === 'all') region = false;
			return Meteor.subscribe('events', region);
		},
		data: function() {
			var today = new Date();
			return {
				calendar_eventlist:      Events.find({startdate: {$gte:today}},{sort: {startdate: 1}}),
				calendar_eventlist_past: Events.find({startdate: {$lt:today}},{sort: {startdate: -1}}),
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Calendar'
		}
	});
});

Template.calendar.rendered = function() {
	this.$('.ellipsis').dotdotdot({
		//CONFIGURATION GOES HERE
	});
};