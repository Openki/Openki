import '/imports/LocalTime.js';

var replicaStartDate = function(originalDate) {
	var originalMoment = moment(originalDate);
	var startMoment = moment.max(originalMoment, moment());
	startMoment.day(originalMoment.day());
	return startMoment;
};

Template.eventReplication.onCreated(function() {
	var instance = this;

	// Store the current date selection for replication
	// Days are stored as difference from the original day
	instance.calcDays = new ReactiveVar([]); // calculated from the dialog
	instance.pickDays = new ReactiveVar([]); // picked in the calendar
	instance.usingPicker = new ReactiveVar(true);

	instance.activeDays = function() {
		return instance.usingPicker.get() ? instance.pickDays.get() : instance.calcDays.get();
	};

	var data = instance.data;
	instance.replicateStartDate = new ReactiveVar(replicaStartDate(data.start));
	instance.replicateEndDate = new ReactiveVar(replicaStartDate(moment(data.start).add(1, 'week')));
});


Template.eventReplication.onRendered(function() {
	var instance = this;

	var pickDays = [];

	instance.autorun(function() {
		Session.get('locale');

		instance.$('.js-replicate-date').datepicker('destroy');
		instance.$('.js-replicate-date').datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			autoclose: true,
			startDate: new Date(),
			format: {
				toDisplay: function(date) {
					return moment(date).format('L');
				},
				toValue: function(date) {
					return moment(date, 'L').toDate();
				}
			}
		}).on('changeDate', function(event) {
			var targetID = event.target.id;
			var date = event.date;
			if (targetID === 'replicateStart') {
				instance.replicateStartDate.set(date);
			} else if (targetID === 'replicateEnd') {
				instance.replicateEndDate.set(date);
			}
		});

		instance.$('.js-replicate-datepick').datepicker('destroy');
		instance.$('.js-replicate-datepick').datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			multidate: true,
			multidateSeperator: ", ",
			todayHighlight: true,
			startDate: new Date()
		}).on('changeDate', function(event) {
			var origin = moment(instance.data.start).startOf('day');
			pickDays = event.dates;

			var days = _.map(pickDays, function(date) {
				return moment(date).diff(origin, 'days');
			});

			instance.pickDays.set(days);
		});
		instance.$('.js-replicate-datepick').datepicker('setDates', pickDays);
	});

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		var target = $(e.target).attr('href');
		instance.usingPicker.set(target == '#datepicker');
	});
});

Template.eventReplication.helpers({
	replicaStart: function() {
		return replicaStartDate(Template.instance().replicateStartDate.get()).format("L");
	},

	replicaEnd: function() {
		return replicaStartDate(Template.instance().replicateEndDate.get()).format("L");
	},

	replicateStartDay: function() {
		var replicateStartDate = Template.instance().replicateStartDate.get();
		return moment(replicateStartDate).format('ddd');
	},

	replicateEndDay: function() {
		var replicateEndDate = Template.instance().replicateEndDate.get();
		return moment(replicateEndDate).format('ddd');
	},

	localDate: function(date) {
		return moment(date).format("l");
	},

	fullDate: function(date) {
		return moment(date).format("LLLL");
	},

	weekDay: function(date) {
		return moment(date).format("ddd");
	},

	affectedReplicaCount: function() {
		Template.instance().subscribe('affectedReplica', this._id);
		return Events.find(affectedReplicaSelectors(this)).count();
	},

	replicaDateCount: function() {
		return Template.instance().activeDays().length;
	},

	replicaDates: function() {
		var start = moment(this.start);
		return _.map(Template.instance().activeDays(), function(days) {
			return moment(start).add(days, 'days');
		});
	}
});

var getEventFrequency = function(instance) {
	var startDate = moment(instance.$('#replicateStart').val(), 'L');
	if (!startDate.isValid()) return [];
	if (startDate.isBefore(moment())) {
		// Jump forward in time so we don't have to look at all these old dates
		startDate = replicaStartDate(startDate);
	}

	var endDate   = moment(instance.$('#replicateEnd').val(), 'L');
	if (!endDate.isValid()) return [];
	var frequency = instance.$('.js-replicate-frequency:checked').val();

	var frequencies = { once:     { unit: 'days',   interval: 1 },
	                    daily:    { unit: 'days',   interval: 1 },
	                    weekly:   { unit: 'weeks',  interval: 1 },
	                    biWeekly: { unit: 'weeks',  interval: 2 } };

	if (frequencies[frequency] === undefined) return [];
	var unit = frequencies[frequency].unit;

	var interval = frequencies[frequency].interval;

	var eventStart = moment(instance.data.start);
	var originDay = moment(eventStart).startOf('day');

	var now = moment();
	var repStart = moment(startDate).startOf('day');
	var days = [];
	while(!repStart.isAfter(endDate)) {
		var daysFromOriginal = repStart.diff(originDay, 'days');
		if (daysFromOriginal !== 0 && repStart.isAfter(now)) {
			days.push(daysFromOriginal);
			if (frequency == 'once') break;
			if (days.length >= 52) break;
		}

		repStart.add(interval, unit);
	}

	return days;
};


Template.eventReplication.events({
	'click .js-replicate-btn': function (event, instance) {
		var startLocal = LocalTime.fromString(instance.data.startLocal);
		var endLocal   = LocalTime.fromString(instance.data.endLocal);

		var replicaDays = instance.activeDays();
		$.each(replicaDays, function(i, days) {
			/*create a new event for each time interval */
			var replicaEvent = {
				startLocal: LocalTime.toString(moment(startLocal).add(days, 'days')),
				endLocal:   LocalTime.toString(moment(endLocal  ).add(days, 'days')),
				title: instance.data.title,
				description: instance.data.description,
				venue: instance.data.venue,
				room: instance.data.room || '',
				region: instance.data.region,
				groups: instance.data.groups,
				replicaOf: instance.data.replicaOf || instance.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};

			var courseId = instance.data.courseId;
			if (courseId) {
				replicaEvent.courseId = courseId;
			}

			// To create a new event, pass an empty Id
			var eventId = '';

			Meteor.call('saveEvent', eventId, replicaEvent, function(error, eventId) {
				if (error) {
					showServerError('Replicating the event went wrong', error);
				} else {
					var fmtDate = LocalTime.fromString(replicaEvent.startLocal).format('LL');
					addMessage(mf('event.replicate.success', { TITLE: replicaEvent.title, DATE: fmtDate }, 'Cloned event "{TITLE}" for {DATE}'), 'success');
				}
			});
		});

		instance.parentInstance().replicating.set(false);
	},

	'change .js-update-replicas, keyup .js-update-replicas': function(event, instance) {
		instance.calcDays.set(getEventFrequency(instance));
	},

	'mouseover .js-replicate-btn': function(event, instance) {
		instance.$('.replica-event-captions').addClass('highlighted');
	},

	'mouseout .js-replicate-btn': function(event, instance) {
		instance.$('.replica-event-captions').removeClass('highlighted');
	},
});
