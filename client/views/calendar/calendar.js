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
				after: today,
				before: limit
			});
		},
		data: function() {
			var today = moment().startOf('day');
			var i = 0;
			
			var days = [];
			for (; i < 8; i++) {
				var after = moment(today).add(i, 'days');
				var before = moment(today).add(i+1, 'days');
				days.push({
					day: after,
					events: eventsFind({
						after: after.toDate(),
						before: before.toDate()
					})
				})
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
		return moment().isAfter(this.enddate);
	}
});