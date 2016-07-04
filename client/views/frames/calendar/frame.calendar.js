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
	calendarDay: function(day) {
		Session.get('timeLocale');
		return moment(day.toDate()).format('dddd, Do MMMM');
	},

	hasDayEvents: function() {
		return this.dayEvents.count() > 0;
	}
});
