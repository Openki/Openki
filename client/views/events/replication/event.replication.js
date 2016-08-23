"use strict";

Template.eventReplication.onCreated(function() {
	this.replicaDates = new ReactiveVar([]);
});


Template.eventReplication.onRendered(function() {
	this.$('.js-replicate-date').datepicker({
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

	updateReplicas(this);
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
		return moment(date).format("L");
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


var updateReplicas = function(template) {
	template.replicaDates.set(_.map(getEventFrequency(template), function(interval) { return interval[0]; } ));
};


var getEventFrequency = function(template) {
	var startDate = moment(template.$('#replicateStart').val(), 'L');
	if (!startDate.isValid()) return [];
	if (startDate.isBefore(moment())) {
		// Jump forward in time so we don't have to look at all these old dates
		startDate = replicaStartDate(startDate);
	}

	var endDate   = moment(template.$('#replicateEnd').val(), 'L');
	if (!endDate.isValid()) return [];
	var frequency = template.$('.-replicateFrequency:checked').val();

	var unit = { once: 'days', daily: 'days', weekly: 'weeks' }[frequency];
	if (unit === undefined) return [];

	var eventStart = moment(template.data.start);
	var originDay = moment(eventStart).startOf('day');
	var eventEnd = moment(template.data.end);

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

		repStart.add(1, unit);
	}

	return dates;
};


Template.eventReplication.events({
	'click .-eventReplicate': function (event, template) {
		//get all startDates where the event should be created
		//this does not do anything yet other than generating the start-end times for a given period

		var dates = getEventFrequency(template);
		var success = true;
		$.each( dates, function( i,eventTime ) {

			/*create a new event for each time interval */
			var replicaEvent = {
				title: template.data.title,
				description: template.data.description,
				location: template.data.location,
				room: template.data.room || '',
				start: eventTime[0].toDate(),
				end: eventTime[1].toDate(),
				files: template.data.files  || [],
				region: template.data.region || Session.get('region'),
				groups: template.data.groups,
				replicaOf: template.data.replicaOf || template.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};

			var courseId = template.data.courseId;
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
					addMessage(mf('event.replicate.success', { TITLE: template.data.title, DATE: fmtDate }, 'Cloned event "{TITLE}" for {DATE}'), 'success');
				}
			});
		});

		template.parentInstance().replicating.set(false);
	},

	'change .-updateReplicas, keyup .-updateReplicas': function(event, template) {
		updateReplicas(template);
	}
});
