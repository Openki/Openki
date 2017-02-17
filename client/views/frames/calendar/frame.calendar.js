Router.map(function () {
	this.route('frameCalendar', {
		path: '/frame/calendar',
		template: 'frameCalendar',
		layoutTemplate: 'frameCalendar',
		data: function() {
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

			var cssRules = [];
			var query = this.params.query;
			_.forEach(customizableProperties, function(property) {
				var queryValue = query[property.key];
				var cssValue;
				if (typeof queryValue !== 'undefined') {
					// hexify color values
					if (property.name.indexOf('color') >= 0) {
						if (queryValue.match(/^[0-9A-F]+$/i)) {
							cssValue = '#' + queryValue.substr(0, 6);
						}
					} else {
						var intVal = parseInt(queryValue, 10);
						if (!Number.isNaN(intVal)) {
							cssValue = Math.max(0, Math.min(1000, intVal)) + 'px';
						}
					}

					if (cssValue) {
						cssRules.push({ selector: property.selector, name: property.name, value: cssValue });
					}
				}
			});

			return { cssRules: cssRules };

		},
		onAfterAction: function() {
			document.title = webpagename + ' Calendar';
		}
	});
});

Template.frameCalendar.onCreated(function() {
	var instance = this;

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


Template.frameCalendarEvent.events({
	'click .js-toggle-event-details': function(e, instance) {
		$(e.currentTarget).toggleClass('active');
		instance.$('.frame-calendar-event-body').toggle();
		instance.$('.frame-calendar-event-time').toggle();
	}
});
