"use strict";

Template.eventReplication.onCreated(function() {
	this.replicaDates = new ReactiveVar([]);
});


Template.eventReplication.onRendered(function() {
	this.$('.replicate_start').datepicker({
		weekStart: moment.localeData().firstDayOfWeek(),
		format: 'L',
	});

	this.$('.replicate_end').datepicker({
		weekStart: moment.localeData().firstDayOfWeek(),
		format: 'L',
	});

	updateReplicas(this);
});


Template.eventReplication.helpers({
	replicaStart: function() {
		return moment.max(moment(this.start), moment()).format("L");
	},

	replicaEnd: function() {
		return moment.max(moment(this.start), moment()).add(1, 'week').format("L");
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
}


var getEventFrequency = function(template) {
	var startDate = moment(template.$('.replicate_start').val(), 'L');
	if (!startDate.isValid()) return [];
	var endDate   = moment(template.$('.replicate_end').val(), 'L');
	if (!endDate.isValid()) return [];
	var frequency = template.$('.replicate_frequency').val();
	var diffDays = endDate.diff(startDate, "days");
	
	var unit = { once: 'days', daily: 'days', weekly: 'weeks' }[frequency];
	if (unit === undefined) return [];
	
	var eventStart = moment(template.data.start);
	var originDay = moment(eventStart).startOf('day');
	var eventEnd = moment(template.data.end);
	
	var now = moment();
	var repStart = moment(startDate).startOf('day');
	var dates = [];
	while(true) {
		var daysFromOriginal = repStart.diff(originDay, 'days');
		if (daysFromOriginal !=0 && repStart.isAfter(now)) {
			dates.push([
				moment(eventStart).add(daysFromOriginal, 'days'),
				moment(eventEnd).add(daysFromOriginal, 'days')
			]);
			if (frequency == 'once') break;
			if (dates.length >= 52) break;
		}

		repStart.add(1, unit);

		if (repStart.isAfter(endDate)) break;
	}

	return dates;
};


Template.eventReplication.events({
	'click button.eventReplicate': function (event, template) {
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
				files: template.data.files  || new Array(),
				mentors: template.data.mentors  ||  new Array(),
				host: template.data.host ||  new Array(),
				region: template.data.region || Session.get('region'),
				groups: template.data.groups,
				replicaOf: template.data.replicaOf || template.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};
		
			var course_id = template.data.course_id;
			if(course_id){
				replicaEvent.course_id  = course_id; 
			}

			var eventId = '';

			Meteor.call('saveEvent', eventId, replicaEvent, function(error, eventId) {
				if (error) {
					addMessage(mf('event.replicate.error', { ERROR: error }, 'Replicating the event went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
					success = false;
				} else {
					var fmtDate = moment(replicaEvent.start).format('LL');
					addMessage(mf('event.replicate.success', { TITLE: template.data.title, DATE: fmtDate }, 'Cloned event "{TITLE}" for {DATE}'), 'success');
				}
			});
		});

		template.parentInstance().replicating.set(false);
	},

	'change .updateReplicas, keyup .updateReplicas': function(event, template) {
		updateReplicas(template);
	}
});
