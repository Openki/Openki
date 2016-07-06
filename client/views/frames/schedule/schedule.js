Router.map(function () {
	this.route('frameSchedule', {
		path: '/frame/schedule',
		layoutTemplate: 'frameLayout',
	});
});

Template.frameSchedule.onCreated(function() {
	var filter = Filtering(EventPredicates);

	this.autorun(function() {
		filter.clear().read(Router.current().params.query);

		filter.add('after', moment(minuteTime.get()).startOf('week'));
		filter.add('end', moment(minuteTime.get()).startOf('week').add(1, 'week'));
		filter.done();
	});

	this.autorun(function() {
		subs.subscribe('eventsFind', filter.toQuery(), 100);
	});

	var instance = this;
	instance.weekdays = new ReactiveVar([]);
	instance.hours = new ReactiveVar([]);

	this.autorun(function() {
		var start = moment(filter.get('after'));
		var end = moment(filter.get('end'));
		var dayCount = end.diff(start, 'days');
		instance.weekdays.set(_.map(_.range(dayCount), function (days) {
			return moment(start).add(days, 'days').format('dddd');
		}));
	});

	this.autorun(function() {
		var start = moment(filter.get('after'));
		var hours = [];

		eventsFind(filter.toQuery(), 100).forEach(function(event) {
			var start = moment(filter.get('after'));
			var date = moment(event.start);
			var hour = date.hour();
			var day = date.diff(start, 'days');
			if (!hours[hour]) {
				hours[hour] = {
					hour: hour,
					days: _.map(instance.weekdays.get(), function() { return []; })
				}
			}
			hours[hour].days[day].push(event);
		});
		instance.hours.set(hours);
	});
});

Template.frameSchedule.helpers({
	weekdays: function() {
		return Template.instance().weekdays.get();
	},

	hours: function() {
		return Template.instance().hours.get();
	},

	hourFormat: function(hour) {
		return moment().hour(hour).minute(0).format('LT');
	}
});