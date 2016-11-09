"use strict";

Template.eventReplication.onCreated(function() {
	// Store the current date selection for replication
	// Days are stored as difference from the original day
	this.calcDays = new ReactiveVar([]); // calculated from the dialog
	this.pickDays = new ReactiveVar([]); // picked in the calendar
	this.usingPicker = new ReactiveVar(true);

	this.activeDays = function() {
		return this.usingPicker.get() ? this.pickDays.get() : this.calcDays.get();
	};
});


Template.eventReplication.onRendered(function() {
	var instance = this;

	var pickDays = [];

	instance.autorun(function() {
		Session.get('locale');

		var $dateInput = instance.$('.js-replicate-date');
		$dateInput.datepicker('remove');
		$dateInput.datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
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
		});

		var $multiDateInput = instance.$('.js-replicate-datepick');
		$multiDateInput.datepicker('remove');
		$multiDateInput.datepicker({
			weekStart: moment.localeData().firstDayOfWeek(),
			language: moment.locale(),
			multidate: true,
			multidateSeperator: ", ",
			todayHighlight: true,
			startDate: new Date()
		}).on('changeDate', function(event) {
			var origin = moment(instance.data.start).startOf('day');
			var dates = event.dates;

			pickDays = dates;
			var days = _.map(dates, function(date) {
				return moment(date).diff(origin, 'days');
			});

			instance.pickDays.set(days);
		});
		$multiDateInput.datepicker('setDates', pickDays);
	});

	$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		var target = $(e.target).attr('href');
		instance.usingPicker.set(target == '#datepicker');
	});
});

var replicaStartDate = function(originalDate) {
	var originalMoment = moment(originalDate);
	var startMoment = moment.max(originalMoment, moment());
	startMoment.day(originalMoment.day());
	return startMoment;
};

Template.eventReplication.helpers({
	replicaStart: function() {
		return replicaStartDate(this.start).format("L");
	},

	replicaEnd: function() {
		return replicaStartDate(this.start).add(1, 'week').format("L");
	},

	localDate: function(date) {
		return moment(date).format("l");
	},

	fullDate: function(date) {
		return moment(date).format("LL");
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
	var eventEnd = moment(instance.data.end);

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
		var start = moment(instance.data.start);
		var end = moment(instance.data.end);

		var replicaDays = instance.activeDays();
		$.each(replicaDays, function(i, days) {
			/*create a new event for each time interval */
			var replicaEvent = {
				start: moment(start).add(days, 'days').toDate(),
				end:   moment(end  ).add(days, 'days').toDate(),
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
					var fmtDate = moment(replicaEvent.start).format('LL');
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
