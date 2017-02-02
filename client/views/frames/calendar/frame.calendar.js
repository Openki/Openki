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

	instance.eventsRendered = new ReactiveVar(false);
	instance.groupedEvents = new ReactiveVar([]);
	instance.days = new ReactiveVar([]);

	this.autorun(function() {
		var filter = Filtering(EventPredicates)
		             .read(Router.current().params.query)
		             .done();

		var filterParams = filter.toParams();
		filterParams.after = new Date();

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

Template.frameCalendar.onRendered(function() {
	var instance = this;
	var query = Router.current().params.query;

	var customizableProperties = [];

	customizableProperties.add = function(key, name, selector) {
		this.push({
			key: key,
			name: name,
			selector: selector
		});
		return this;
	};

	customizableProperties
		.add('bgcolor', 'background-color', 'body')
		.add('color', 'color', 'body')
		.add('eventbg', 'background-color', '.frame-calendar-event')
		.add('eventcolor', 'color', '.frame-calendar-event')
		.add('linkcolor', 'color', '.frame-calendar-event a')
		.add('fontsize', 'font-size', '*');

	instance.autorun(function() {
		var eventsRendered = instance.eventsRendered.get();
		if (eventsRendered) {
			_.forEach(customizableProperties, function(property) {
				var value = query[property.key];
				if (value) {
					var propertyName = property.name;

					// hexify color values
					if (~propertyName.indexOf('color')) {
						value = '#' + value;
					}

					$(property.selector).css(property.name, value);
				}
			});
		}
	});
});

Template.frameCalendarEvent.events({
	'click .js-toggle-event-details': function(e, instance) {
		var jQueryTarget = $(e.currentTarget);

		jQueryTarget.toggleClass('active');
		jQueryTarget.nextAll('.frame-calendar-event-body').toggle();
		jQueryTarget.children('.frame-calendar-event-time').toggle();
	}
});

Template.frameCalendarEvent.onRendered(function() {
	var eventsRendered = this.parentInstance().eventsRendered;
	if (!eventsRendered.get()) eventsRendered.set(true);
});
