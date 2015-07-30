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
		var today = moment().startOf('day');
		var i = 0;
		var days = [];
		for (; i < 8; i++) {
			days.push({
				start: moment(today).add(i, 'days'),
				end: moment(today).add(i+1, 'days')
			});
		}
		return days;
	},
	filter: function() {
		return Template.instance().filter;
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

		var today = moment().startOf('day').toDate();
		var limit = moment(today).add(8, 'days').toDate();

		filterQuery.period = [today, limit];
		if (eventSub) oldSubs.push(eventSub);
		eventSub = instance.subscribe('eventsFind', filterQuery, stopOldSubs);
	});
});

Template.calendar.rendered = function() {
	this.$('.ellipsis').dotdotdot({});
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="' + currentPath + '"].nav_link').addClass('active');
};
