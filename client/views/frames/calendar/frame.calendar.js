import Metatags from '/imports/Metatags.js';
import '/imports/ui/lib/CSSFromQuery.js';

Router.map(function () {
	this.route('frameCalendar', {
		path: '/frame/calendar',
		template: 'frameCalendar',
		layoutTemplate: 'frameLayout',
		data: function() {
			var cssRules = new CSSFromQuery();
			cssRules
				.add('regionbg', 'background-color', '.frame-calendar-event-region')
				.add('regioncolor', 'color', '.frame-calendar-event-region')
				.read(this.params.query);

			return { cssRules: cssRules };
		},
		onAfterAction: function() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		}
	});
});

Template.frameCalendar.onCreated(function() {
	var instance = this;

	instance.groupedEvents = new ReactiveVar([]);
	instance.days = new ReactiveVar([]);

	instance.autorun(function() {
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

	instance.allRegions = Session.get('region') == 'all';
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


Template.frameCalendarEvent.onCreated(function() {
	this.expanded = new ReactiveVar(false);
});


Template.frameCalendarEvent.helpers({
	'allRegions': function() {
		return Template.instance().parentInstance().allRegions;
	},

	'regionName': function() {
		return Regions.findOne(this.region).name;
	},

	'expanded': function() {
		return Template.instance().expanded.get();
	}
});

Template.frameCalendarEvent.events({
	'click .js-toggle-event-details': function(e, instance) {
		$(e.currentTarget).toggleClass('active');
		instance.$('.frame-calendar-event-time').toggle();
		instance.expanded.set(!instance.expanded.get());
	}
});
