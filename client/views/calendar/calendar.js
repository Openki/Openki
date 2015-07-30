Router.map(function () {
	this.route('calendar', {
		path: 'calendar',
		template: 'calendar',
		data: function() { return this.params; },
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
	},
	days: function() {
		var start = Template.instance().filter.get('start');
		var i = 0;
		var days = [];
		for (; i < 8; i++) {
			days.push({
				start: moment(start).add(i, 'days'),
				end: moment(start).add(i+1, 'days')
			});
		}
		return days;
	},
	filter: function() {
		return Template.instance().filter;
	},
	startDate: function() {
		return Template.instance().filter.get('start').format('LL');
	},
	endDate: function() {
		return Template.instance().filter.get('start').add(8, 'days').format('LL');
	}
});

Template.calendarDay.helpers({
	hasEvents: function() {
		var filterQuery = this.filter.toQuery();
		filterQuery.period = [this.day.start.toDate(), this.day.end.toDate()];

		return eventsFind(filterQuery).count() > 0;
	},
	events: function() {
		var filterQuery = this.filter.toQuery();
		filterQuery.period = [this.day.start.toDate(), this.day.end.toDate()];

		return eventsFind(filterQuery);
	}
});

Template.calendar.onCreated(function() {
	var instance = this;

	var filter = Filtering(EventPredicates);
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var data = Template.currentData();
		var query = data.query || {};

		filter
			.clear()
			.add('start', moment())
			.add('region', Session.get('region'))
			.read(query)
			.done();
	});

	// Keep old subscriptions around until the new ones are ready
	var eventSub = false;
	var oldSubs = [];
	var stopOldSubs = function() {
		if (eventSub.ready()) {
			_.map(oldSubs, function(sub) { sub.stop() });
			oldSubs = [];
		}
	}

	instance.autorun(function() {
		var filterQuery = filter.toQuery();

		var start = filter.get('start').toDate();
		var limit = filter.get('start').add(8, 'days').toDate();

		filterQuery.period = [start, limit];
		if (eventSub) oldSubs.push(eventSub);
		eventSub = instance.subscribe('eventsFind', filterQuery, stopOldSubs);
	});
});

Template.calendar.rendered = function() {
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="' + currentPath + '"].nav_link').addClass('active');
};

Template.calendar_event.rendered = function() {
	this.$('.ellipsis').dotdotdot({});
};

Template.calendar.events({
	'click .nextDay': function(event, instance) {
		var start = instance.filter.get('start');
		start.add(1, 'day');
		instance.filter.add('start', start).done();
		return false;
	},

	'click .prevDay': function(event, instance) {
		var start = instance.filter.get('start');
		start.subtract(1, 'day');
		instance.filter.add('start', start).done();
		return false;

	},
	'click .nextWeek': function(event, instance) {
		var start = instance.filter.get('start');
		start.add(1, 'week');
		instance.filter.add('start', start).done();
		return false;
	},

	'click .prevWeek': function(event, instance) {
		var start = instance.filter.get('start');
		start.subtract(1, 'week');
		instance.filter.add('start', start).done();
		return false;

	},
});
