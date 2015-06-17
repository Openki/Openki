Router.map(function () {
	this.route('calendar', {
		path: 'calendar',
		template: 'calendar',
		waitOn: function () {
			var region = Session.get('region');
			if (region === 'all') region = false;
			   
			var today = moment().startOf('day').toDate();
			var limit = moment(today).add(8, 'days').toDate();

			return Meteor.subscribe('eventsFind', {
				region: region,
				period: [today, limit]
			});
		},
		data: function() {
			var today = moment().startOf('day');
			var i = 0;
			
			var days = [];
			for (; i < 8; i++) {
				var start = moment(today).add(i, 'days');
				var end = moment(today).add(i+1, 'days');
				days.push({
					day: start,
					events: eventsFind({
						period: [start.toDate(), end.toDate()]
					})
				});
			}
			return days;
		},
		onAfterAction: function() {
			document.title = webpagename + 'Calendar'
		}
	});
});

Template.calendar.helpers({
	weekday: function(day) {
		return day.format('dddd Do MMMM');
	},
	past: function() {
		return moment().isAfter(this.end);
	}
});

Template.calendar.rendered = function() {
	this.$('.ellipsis').dotdotdot({});
};
