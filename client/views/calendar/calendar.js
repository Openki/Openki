import Metatags from '/imports/Metatags.js';

Router.map(function () {
	this.route('calendar', {
		path: 'calendar',
		template: 'calendar',
		data: function() { return this.params; },
		onAfterAction: function() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		}
	});
});

Template.calendar.onCreated(function() {
	var instance = this;

	var filter = Filtering(EventPredicates);
	instance.filter = filter;

	// Read URL state
	instance.autorun(function() {
		var query = Router.current().params.query;

		// Show internal events only when a group or venue is specified
		if (!query.group && !query.venue && query.internal === undefined) {
			query.internal = false;
		}

		filter
			.clear()
			.add('start', moment().startOf('week'))
			.read(query)
			.add('region', Session.get('region'))
			.done();
	});

	instance.autorun(function() {
		var filterQuery = filter.toQuery();

		var start = filter.get('start').toDate();
		var limit = filter.get('start').add(1, 'week').toDate();

		filterQuery.period = [start, limit];
		instance.eventSub = subs.subscribe('eventsFind', filterQuery);

	});
});

var updateUrl = function(event, instance) {
	var filterParams = instance.filter.toParams();
	delete filterParams.region; // HACK region is kept in the session (for bad reasons)
	var queryString = UrlTools.paramsToQueryString(filterParams);

	var options = {};
	if (queryString.length) {
		options.query = queryString;
	}

	Router.go('calendar', {}, options);
	event.preventDefault();
};

Template.calendar.helpers({
	days: function() {
		var start = Template.instance().filter.get('start');
		var i = 0;
		var days = [];
		for (; i < 7; i++) {
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
		Session.get('timeLocale');
		return moment(Template.instance().filter.get('start'));
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
	},
	calendarDay: function(day) {
		Session.get('timeLocale');
		return moment(day.toDate()).format('dddd, Do MMMM');
	},
	eventsReady: function() {
		var instance = Template.instance();
		return instance.parentInstance().eventSub.ready();
	}
});


Template.calendarNav.helpers({
	endDateTo: function(date) {
		return moment(date).add(6, 'days');
	}
});

Template.calendarNav.onCreated(function() {
	this.currentUnit = new ReactiveVar('week');
});

Template.calendarNav.onRendered(function() {
	var navContainer = this.$('.calendar-nav-container');
	navContainer.slideDown();

	$(window).scroll(function () {
		var isCovering = navContainer.hasClass('calendar-nav-container-covering');
		var atTop = $(window).scrollTop() < 5;

		if (!isCovering && !atTop) {
			navContainer.addClass('calendar-nav-container-covering');
		} else if (isCovering && atTop) {
			navContainer.removeClass('calendar-nav-container-covering');
		}
	});
});

var mvDateHandler = function(unit, instance) {
	var amount = instance.data.direction == 'previous' ? -1 : 1;
	var calendarInstance = instance.parentInstance(2);
	var start = calendarInstance.filter.get('start');
	var weekCorrection = unit == "week"? 0 : 1;

	if (amount < 0) {
		start.add(amount, unit).startOf('week');
	} else {
		start.add(amount, unit).add(weekCorrection, 'week').startOf('week');
	}
	calendarInstance.filter.add('start', start).done();
	updateUrl(event, calendarInstance);
	return false;
};

Template.calendarNavControl.events({
	'click .js-change-date': function(event, instance) {
		var unit = instance.parentInstance().currentUnit.get();
		mvDateHandler(unit, instance);
	},

	'click .js-change-unit': function(event, instance) {
		var unit = this;
		instance.parentInstance().currentUnit.set(unit);
		mvDateHandler(unit, instance);
	}
});

Template.calendarNavControl.helpers({
	arrow: function() {
		var isRTL = Session.get('textDirectionality') == 'rtl';

		if (this.direction == 'previous') {
			isRTL = !isRTL;
		}

		var direction = isRTL ? 'left' : 'right';
		return Spacebars.SafeString(
			'<span class="fa fa-arrow-' + direction + ' fa-fw" aria-hidden="true"></span>'
		);
	},

	mfString: function(direction, unit, length) {
		return mf('calendar.' + direction + '.' + unit + '.' + length);
	},

	currentUnit: function() {
		var parentInstance = Template.instance().parentInstance();
		return parentInstance.currentUnit.get();
	},

	navUnits: function() {
		var navUnits = ['week', 'month', 'year'];
		return navUnits;
	}
});

Template.calendarAddEvent.onRendered(function() {
	var instance = this;
	var eventCaption = instance.$('.event-caption-add');

	function toggleCaptionClass(e) {
		var removeClass = e.type == 'mouseout';
		eventCaption.toggleClass('placeholder', removeClass);
	}

	eventCaption.on('mouseover mouseout', function(e) { toggleCaptionClass(e); });
	instance.$('.event-caption-add-text').on('mouseover mouseout', function(e) { toggleCaptionClass(e); });
});
