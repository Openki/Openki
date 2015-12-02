"use strict";
// routing is in /routing.js

Template.event.onCreated(function() {
	this.editing = new ReactiveVar(!this.data._id);
});


Template.eventDisplay.onCreated(function() {
	this.locationTracker = LocationTracker();
	this.replicaDates = new ReactiveVar([]);
});


Template.eventDisplay.onRendered(function() {
	this.locationTracker.setRegion(this.data.region);
	this.locationTracker.setLocation(this.data.location);

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


Template.eventPage.helpers({
	course: function() {
		var courseId = this.course_id;
		if (courseId) {
			// Very bad?
			Template.instance().subscribe('courseDetails', courseId);
			
			return Courses.findOne({_id: courseId});
		}
	},
});


Template.event.helpers({
	editing: function() {
		return this.new || Template.instance().editing.get();
	},
});


Template.eventDisplay.helpers({
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
	
	mayEdit: function() {
		return mayEditEvent(Meteor.user(), this);
	},
	eventMarkers: function() {
		return Template.instance().locationTracker.markers;
	},
	haveLocation: function() {
		return this.location && this.location.loc
	}
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


Template.event.events({
	'click button.eventDelete': function () {
		if (pleaseLogin()) return;
		if (confirm('Delete event "'+this.title+'"?')) {
			var title = this.title;
			var course = this.course_id;
			Meteor.call('removeEvent', this._id, function (error, eventRemoved){
				if (eventRemoved) {
					addMessage(mf('event.removed', { TITLE: title }, 'Successfully removed event "{TITLE}".'), 'success');
					if (course) Router.go('showCourse', { _id: course });
				} else {
					addMessage(mf('event.remove.error', { TITLE: title }, 'Error during removal of event "{TITLE}".'), 'danger');
				}
			});
			Template.instance().editing.set(false);
		}
	},
	
	'click button.eventEdit': function (event, instance) {
		if (pleaseLogin()) return;
		instance.editing.set(true);
	},
	
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

		template.$('div#eventReplicationMenu').slideUp(300);
		template.$('.eventReplicateMenu_close').hide(500);
		template.$('.eventReplicateMenu_open').show(500);
	},

	'click .eventReplicateMenu_open': function(event, template){
		template.$('div#eventReplicationMenu').slideDown(300);
		template.$('.eventReplicateMenu_open').hide(500);
		template.$('.eventReplicateMenu_close').show(500);
	},

	'click .eventReplicateMenu_close': function(event, template){
		template.$('div#eventReplicationMenu').slideUp(300);
		template.$('.eventReplicateMenu_close').hide(500);
		template.$('.eventReplicateMenu_open').show(500);
	},
});

Template.eventDisplay.events({
	'change .updateReplicas, keyup .updateReplicas': function(event, template) {
		updateReplicas(template);
	}
});
