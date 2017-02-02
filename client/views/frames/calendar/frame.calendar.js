Router.map(function () {
	this.route('frameCalendar', {
		path: '/frame/calendar',
		template: 'frameCalendar',
		layoutTemplate: 'frameCalendar',
		onAfterAction: function() {
			document.title = webpagename + ' Calendar';
		}
	});
});

Template.frameCalendar.onCreated(function() {
	var instance = this;

	instance.startOfWeek = new ReactiveVar();
	instance.groupedEvents = new ReactiveVar([]);
	instance.days = new ReactiveVar([]);

	this.autorun(function() {
		minuteTime.get();
		instance.startOfWeek.set(moment().startOf('week'));
	});

	this.autorun(function() {
		var filter = Filtering(EventPredicates)
		             .read(Router.current().params.query)
		             .done();

		var filterParams = filter.toParams();
		var startOfWeek = instance.startOfWeek.get();
		filterParams.after = startOfWeek.toDate();

		instance.subscribe('eventsFind', filterParams, 200);

		var events = Events.find({}, {sort: {start: 1}}).fetch();
		var groupedEvents = _.groupBy(events, function(event) {
			return moment(event.start).format('LL');
		});

		instance.groupedEvents.set(groupedEvents);
		instance.days.set(Object.keys(groupedEvents));
	});
});

Template.frameCalendar.helpers({
	'ready': function() {
		return Template.instance().subscriptionsReady();
	},

	'days': function() {
		return Template.instance().days.get();
	},

	'eventsOn': function(day) {
		var groupedEvents = Template.instance().groupedEvents.get();
		return groupedEvents[day];
	}
});

Template.frameCalendarEvent.events({
	'click .js-toggle-event-details': function(e, instance) {
		var jQueryTarget = $(e.currentTarget);

		jQueryTarget.toggleClass('active');
		jQueryTarget.nextAll('.frame-calendar-event-body').toggle();
		jQueryTarget.children('.frame-calendar-event-time').toggle();
	}
});
