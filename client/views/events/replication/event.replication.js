"use strict";

Template.eventReplication.onCreated(function() {
	this.replicaDates = new ReactiveVar([]);
});


Template.eventReplication.onRendered(function() {
	var instance = this;

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
	});

	instance.$('.js-replicate-datepick').datepicker({
		weekStart: moment.localeData().firstDayOfWeek(),
		language: moment.locale(),
		multidate: true,
		multidateSeperator: ", ",
		todayHighlight: true,
		startDate: new Date()
	}).on('changeDate', function(event) {
		var dates = [];
		for (var i = 0; i < event.dates.length; i++) {
			dates.push(moment(event.dates[i]));
		}

		// http://www.codeproject.com/Articles/625832/How-to-Sort-Date-and-or-Time-in-JavaScript
		var sortByDateAsc = function (lhs, rhs) {
			return lhs > rhs ? 1 : lhs < rhs ? -1 : 0;
		};
		dates.sort(sortByDateAsc);

		instance.replicaDates.set(dates);
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
		return moment(date).format("D. MMM");
	},

	affectedReplicaCount: function() {
		Template.instance().subscribe('affectedReplica', this._id);
		return Events.find(affectedReplicaSelectors(this)).count();
	},

	replicaDateCount: function() {
		return Template.instance().replicaDates.get().length;
	},

	replicaDates: function() {
		return Template.instance().replicaDates.get();
	},
});


var updateReplicas = function(instance) {
	instance.replicaDates.set(_.map(getEventFrequency(instance), function(interval) { return interval[0]; } ));
};


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

	var unit = frequencies[frequency].unit;
	if (unit === undefined) return [];

	var interval = frequencies[frequency].interval;

	var eventStart = moment(instance.data.start);
	var originDay = moment(eventStart).startOf('day');
	var eventEnd = moment(instance.data.end);

	var now = moment();
	var repStart = moment(startDate).startOf('day');
	var dates = [];
	while(!repStart.isAfter(endDate)) {
		var daysFromOriginal = repStart.diff(originDay, 'days');
		if (daysFromOriginal !== 0 && repStart.isAfter(now)) {
			dates.push([
				moment(eventStart).add(daysFromOriginal, 'days'),
				moment(eventEnd).add(daysFromOriginal, 'days')
			]);
			if (frequency == 'once') break;
			if (dates.length >= 52) break;
		}

		repStart.add(interval, unit);
	}

	return dates;
};


Template.eventReplication.events({
	'click .js-replicate-btn': function (event, instance) {
		//get all startDates where the event should be created
		//this does not do anything yet other than generating the start-end times for a given period

		var replicaDates = instance.replicaDates.get();
		var eventMoments = [];

		var eventStart = moment(instance.data.start).format('LT');
		var eventEnd = moment(instance.data.end).format('LT');

		var readDateTime = function(dateStr, timeStr) {
			return moment(dateStr+' '+timeStr, 'L LT');
		};

		for (var i = 0; i < replicaDates.length; i++) {
			var date = replicaDates[i].format('L');
			eventMoments[i] = [];
			eventMoments[i].push(readDateTime(date, eventStart));
			eventMoments[i].push(readDateTime(date, eventEnd));
		}

		var success = true;
		$.each(eventMoments, function(i, eventTime) {
			/*create a new event for each time interval */
			var replicaEvent = {
				title: instance.data.title,
				description: instance.data.description,
				location: instance.data.location,
				room: instance.data.room || '',
				start: eventTime[0].toDate(),
				end: eventTime[1].toDate(),
				files: instance.data.files  || [],
				region: instance.data.region || Session.get('region'),
				groups: instance.data.groups,
				replicaOf: instance.data.replicaOf || instance.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};

			var courseId = instance.data.courseId;
			if (courseId) {
				replicaEvent.courseId = courseId;
			}

			var eventId = '';

			Meteor.call('saveEvent', eventId, replicaEvent, function(error, eventId) {
				if (error) {
					showServerError('Replicating the event went wrong', error);
					success = false;
				} else {
					var fmtDate = moment(replicaEvent.start).format('LL');
					addMessage(mf('event.replicate.success', { TITLE: instance.data.title, DATE: fmtDate }, 'Cloned event "{TITLE}" for {DATE}'), 'success');
				}
			});
		});

		instance.parentInstance().replicating.set(false);
	},

	'mouseover .js-replicate-btn': function(event, instance) {
		instance.$('.replica-event-captions').addClass('highlighted');
	},

	'mouseout .js-replicate-btn': function(event, instance) {
		instance.$('.replica-event-captions').removeClass('highlighted');
	}
});
