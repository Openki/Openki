"use strict";

Template.eventEdit.onCreated(function() {
	var instance = this;
	instance.parent = instance.parentInstance();
	instance.selectedRegion = new ReactiveVar(this.data.region || Session.get('region'));
	instance.selectedLocation = new ReactiveVar(this.data.location || {});
});

Template.eventEdit.onRendered(function() {
	updateTimes(this, false);
});


Template.eventEdit.helpers({
	isoDateFormat: function(date) {
		return moment(date).format("YYYY-MM-DD");
	},
	
	affectedReplicaCount: function() {
		Template.instance().subscribe('affectedReplica', this._id);
		return Events.find(affectedReplicaSelectors(this)).count();
	},

	regions: function(){
		return Regions.find();
	},
	
	showRegionSelection: function() {
		// You can select the region for events that are new and not associated
		// with a course
		if (this._id) return false;
		if (this.course_id) return false;
		return true;
	},
	
	currentRegion: function(region) {
		var currentRegion = Session.get('region')
		return currentRegion && region._id == currentRegion;
	},
	
	disableForPast: function() {
		return this.start > new Date ? '' : 'disabled';
	},
});

Template.eventDescritpionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
}


var getEventStartMoment = function(template) {
	var startDateStr = template.$('#edit_event_startdate').val();
	var startMoment =  moment(startDateStr, 'YYYY-MM-DD');
	var startTime = template.$('#edit_event_starttime').val();
	var startTimeParts = startTime ? startTime.split(":") : [0,0];
	var minutes = startTimeParts[1];
	var hours = startTimeParts[0];
	startMoment.hours(hours);
	startMoment.minutes(minutes);
	return startMoment;
}

var getEventEndMoment = function(template) {
	var startMoment = getEventStartMoment(template);
	var endMoment = moment(startMoment);
	var endTime = template.$('#edit_event_endtime').val();
	var endTimeParts = endTime ? endTime.split(":") : [0,0];
	var minutes = endTimeParts[1];
	var hours = endTimeParts[0];
	endMoment.hours(hours);
	endMoment.minutes(minutes);
	if(endMoment.diff(startMoment) < 0) {
		endMoment.add(1,"day");
	}

	return endMoment;
}

var getEventDuration = function(template) {
	var duration = parseInt(template.$('#edit_event_duration').val(), 10);
	return Math.max(0,duration);
}


/* Patch the end time and the duration when start, end or duration changes */
var updateTimes = function(template, updateEnd) {
	var start = getEventStartMoment(template);
	var end = getEventEndMoment(template);
	var duration = getEventDuration(template);

	if (!start.isValid() || !end.isValid()) {
		// If you put into the machine wrong figures, will the right answers come out?
		return;
	}

	if (updateEnd) {
		end = moment(start).add(duration, 'minutes');
	}

	if (end.isBefore(start)) {
		// Let sanity prevail
		end = start;
		duration = 0;
	}

	duration = end.diff(start, 'minutes');
	template.$('#edit_event_startdate').val(start.format('YYYY-MM-DD'));
	template.$('#edit_event_starttime').val(start.format('HH:mm'));
	template.$('#edit_event_endtime').val(end.format('HH:mm'));
	template.$('#edit_event_duration').val(duration.toString());
}

Template.eventEdit.events({
	'change .eventFileInput': function(event, template) {
		template.$('button.eventFileUpload').toggle(300);
	}, 

	'click button.eventFileUpload': function(event, template) {
		
		var fileEvent = $('.eventFileInput')[0].files;
		
		//FS.Utility.eachFile(fileEvent, function(file) {
		$.each( fileEvent, function(i,file){

			Files.insert(file, function (err, fileObj) {

				if (err){
					// add err handling
				} else {
					//adds a single file at a time at the moment
					var fileList = [
						{
							_id: fileObj._id,
							file : "/cfs/files/files/" + fileObj._id,
							filename : fileObj.original.name,
							filesize : fileObj.original.size,
						}
					];
					template.files = fileList;
					template.$('button.eventFileUpload').hide(50);
				
					var fileHtml = '<tr id="row-' + fileObj._id + '">';
					fileHtml += '<td style="padding-right:5px;">';
					fileHtml += '<a href="/cfs/files/files/' + fileObj._id + '" target="_blank">' + fileObj.original.name + '</a>';
					fileHtml += '</td><td><button role="button" class="fileDelete close" type="button">';
					fileHtml += '<span class="glyphicon glyphicon-remove"></span></button></td></tr>';
				
					$("table.file-list").append(fileHtml);
				
				}
			});
		});
	},
	
	'click button.fileDelete': function (event, template) {
		var fileid = this._id;
		var eventid = template.data._id;
		var filename = this.filename;
		//delete the actual file
		var fp = Files.remove(fileid);
		
		//hide file name
		var rowid = "tr#row-" + fileid;		
		$(rowid).hide();
		
		//remove file attribute from the event
		Meteor.call('removeFile', eventid, fileid, function (error, fileRemoved){
			if (fileRemoved) addMessage(mf('file.removed', { FILENAME:filename }, 'Successfully removed file {FILENAME}.'), 'success');
			else addMessage(mf('file.removed.fail', { FILENAME:filename }, "Couldn't remove file {FILENAME}."), 'danger');
		});		
	},
	
	'submit': function(event, template) {
		event.preventDefault();

		if (pleaseLogin()) return;

		var start = getEventStartMoment(template);
		if(!start.isValid()) {
			alert("Date format must be of the form 2015-11-30");
			return null;
		}
		var end = getEventEndMoment(template);

		var editevent = {
			title: template.$('#edit_event_title').val(),
			description: template.$('#edit_event_description').html(),
			location: template.selectedLocation.get(),
			room: template.$('#edit_event_room').val(),
			start: start.toDate(),
			end:   end.toDate(),
			files: this.files || Array() ,
		};

		var fileList = template.files;
		template.files = null;

		//check if file object is stored in the template object
		if(fileList != null){
			var tmp = [];		
			if(this.files){	
				$.each( this.files, function( i,fileObj ){
					tmp.push( fileObj );
				});
			}
			
			$.each( fileList, function( i, fileObj ){
				tmp.push( fileObj );
			});	
					
			editevent.files = tmp;
		}		

		var eventId = this._id;
		var isNew = !this._id;
		var now = moment();
		if (isNew) {
			eventId = '';

			if (start.isBefore(now)) {
				alert("Date must be in future");
				return;
			}

			if (this.course_id) {
				var course = Courses.findOne(this.course_id);
				editevent.region = course.region;
				editevent.course_id = this.course_id;
			} else {
				editevent.region = template.$('.region_select').val();

				var groups = [];
				if (Router.current().params.query.group) {
					groups.push(Router.current().params.query.group);
				}
				editevent.groups = groups;
			}
		} else {
			// Don't allow setting dates in the past
			if (start.isBefore(now)) {
				delete editevent.start;
			}
			if (end.isBefore(now)) {
				delete editevent.end;
			}
		}
		
		var updateReplicas = template.$("input[name='updateReplicas']").is(':checked');
		
		Meteor.call('saveEvent', eventId, editevent, updateReplicas, function(error, eventId) {
			if (error) {
				addMessage(mf('event.saving.error', { ERROR: error }, 'Saving the event went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				if (isNew) {
					Router.go('showEvent', { _id: eventId });
					addMessage(mf('event.creating.success', { TITLE: editevent.title }, 'Created event "{TITLE}".'), 'success');
				} else {
					addMessage(mf('event.saving.success', { TITLE: editevent.title }, 'Saved changes to event "{TITLE}".'), 'success');
				}

				if (updateReplicas) {
					addMessage(mf('event.edit.replicates.success', { TITLE: editevent.title }, 'Replicas of "{TITLE}" also updated.'), 'success');
				}
				template.parent.editing.set(false);
			}
		});
	},
	
	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		instance.parent.editing.set(false);
	},

	'click .toggle_duration': function(event, template){
		template.$('.show_time_end').toggle(300);
		template.$('.show_duration').toggle(300);
	},

	'change #edit_event_duration, change #edit_event_startdate, change #edit_event_starttime': function(event, template) {
		updateTimes(template, true);
	},

	'change #edit_event_endtime': function(event, template) {
		updateTimes(template, false);
	},
});
