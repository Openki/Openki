Router.map(function () {
	this.route('frameCalendar', {
		path: '/frame/calendar',
		template: 'frameCalendar',
		layoutTemplate: 'frameCalendar',
		waitOn: function () {
			this.filter = Filtering(EventPredicates).read(this.params.query).done();

			var filterParams = this.filter.toParams();
			var startOfWeek = moment().startOf('week');
			filterParams.after = startOfWeek.toDate();
			filterParams.before = moment(startOfWeek).add(1, 'week').toDate();

			return Meteor.subscribe('eventsFind', filterParams, 200);
		},

		data: function() {
			// These race the before/after in the waitOn. Not good, should be using exactly the same state
			var start = moment().startOf('week');
			var end = moment(start).add(1, 'week');

			var weekdays = [];
			var current = moment(start);
			while (current.isBefore(end)) {
				var next = moment(current).add(1, 'day');
				var filterParams = this.filter.toParams();
				filterParams.after = current.toDate();
				filterParams.before = next.toDate();

				weekdays.push({
					date: current,
					dayEvents: eventsFind(filterParams, 200)
				});
				current = next;
			}
			return weekdays;
		},

		onAfterAction: function() {
			document.title = webpagename + ' Calendar';
		}
	});
});

Template.frameCalendar.helpers({
	weekday:  function() { return this.format('ddd'); },
	monthday: function() { return this.format('D'); },
});

Template.frameCalendarEvent.onRendered(function() {
	this.$('.-eventLocationTime').dotdotdot({
		height: 55,
		watch : "window",
	});
	this.$('.-eventTitle').dotdotdot({
		watch: "window",
	});
	this.$('.-eventDescription').dotdotdot({
		watch: "window",
	});
});

Template.frameCalendarEvent.helpers({
	timely: function() { return moment().add(1, 'day').isAfter(this) && moment().subtract(1, 'day').isBefore(this); }
});
