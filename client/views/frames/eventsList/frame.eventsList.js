Router.map(function () {
	this.route('frameEventsList', {
		path: '/frame/eventsList',
		template: 'frameEventsList',
		layoutTemplate: 'frameEventsList',
		onAfterAction: function() {
			document.title = webpagename + ' Calendar';
		}
	});
});

Template.frameEventsList.onCreated(function() {
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

Template.frameEventsList.helpers({
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

Template.frameEventsList.events({
	'click .js-toggle-event-details': function(e, instance) {
		var jQueryTarget = $(e.currentTarget);

		jQueryTarget.toggleClass('active');
		jQueryTarget.nextAll('.list-event-body').toggle();
		jQueryTarget.children('.list-event-time').toggle();
	}
});
