"use strict";

Template.event.created = function() {
	this.editing = new ReactiveVar(false);
	this.replicasExist = new ReactiveVar(false);
}

Template.event.onRendered(function(){
	if (this.editing.get()) setDurationInTemplate(this);
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

	kioskMode: function() {
		return Session.get('kiosk_mode');
	}
});

Template.eventPage.helpers({
	isEvent: function() {
		return (this._id !== undefined) || this.new;
	}
});

Template.event.helpers({
	isoDateFormat: function(date) {
		return moment(date).format("YYYY-MM-DD");
	},
	editing: function() {
		return this.new || Template.instance().editing.get();
	},
	replicasExist: function() {
		return Template.instance().replicasExist.get();
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

	frequencyOptions:function() {
		return [{
			frequency:0,
			text:mf('event.replication.freq.once', 'once')
		},{
			frequency:1,
			text:mf('event.replication.freq.daily', 'every day')
		},{
			frequency:7,
			text:mf('event.replication.freq.weekly', 'once a week')
		},{
			frequency:30,
			text:mf('event.replication.freq.monthly', 'once a month')
		}];
	},
	
	mayEdit: function() {
		return mayEditEvent(Meteor.user(), this);
	},

	kioskMode: function() {
		return Session.get('kiosk_mode');
	}
});

Template.eventDescritpionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
}


var getEventStartMoment = function(template) {
	var startMoment =  moment(template.$('#edit_event_startdate').val())
	var startTime = template.$('#edit_event_starttime').val();
	var startTimeParts = startTime.split(":");
	var minutes = startTimeParts[1];
	var hours = startTimeParts[0];
	startMoment.hours(hours);
	startMoment.minutes(minutes);
	return startMoment;
}

var getEventEndMoment = function(template) {
	var startMoment = getEventStartMoment(template);
	var endMoment = moment(startMoment);
	var endtime = template.$('#edit_event_endtime').val();
	var endtimeParts = endtime.split(":");
	var minutes = endtimeParts[1];
	var hours = endtimeParts[0];
	endMoment.hours(hours);
	endMoment.minutes(minutes);
	if(endMoment.diff(startMoment) < 0) {
		endMoment.add(1,"day");
	}

	return endMoment;
}

var getEventDuration = function(template) {
	var duration = parseInt(template.$('#edit_event_duration').val(),10);

	return Math.max(0,duration);
}

var calculateEndMoment = function(startMoment, duration) {
	return moment(startMoment).add(duration, "minutes"); 
}

var setDurationInTemplate = function(template) {
	var startMoment = getEventStartMoment(template);
	var endMoment = getEventEndMoment(template);
	var duration = endMoment.diff(startMoment, "minutes");
	template.$("#edit_event_duration").val(duration);
};


var getEventFrequency = function(template) {
	
	var startDate =  moment(template.$('#edit_event_startdate').val());	//2015-05-06T12:15:39.565Z
	
	//check if startDate is also before endDate
	var nowMoment = moment();
	if (startDate.diff(nowMoment)<0) {
		alert("Date must be in future");
		return;
	}
	var endDate = moment(template.$('#edit_event_enddate').val());
	var frequency = template.$('#edit_frequency').val();
	var diffDays = endDate.diff(startDate, "days");
	

	
	//detect how many events we should create
	//and return a list of start-end times when the events should be created
	var nrEvents = Math.floor(diffDays/frequency) + 1;
	
	var unit = "";
	if(frequency == 0){ //once
		unit = "days"; //doesn't matter what we set here
		nrEvents = 1;		
	}
	else if(frequency == 1){ //every day
		unit = "days";		
	}
	else if(frequency == 7){ //every week
		unit = "weeks";
	}
	else if(frequency == 30){ //every month
		unit = "months";
	}


	//get start and end dates from the replication form
	var startMoment = startDate.toDate();
	var endMoment = endDate.toDate();
	
	//get the hour and minute from the replicated event
	var origEventStartDate = template.data.startdate;
	var startHours = origEventStartDate.getHours();
	var startMinutes = origEventStartDate.getMinutes();
	var origEventEndDate = template.data.enddate;
	var endHours = origEventEndDate.getHours();
	var endMinutes = origEventEndDate.getMinutes();


	var dates = [];
	
	for(var i = 0; i < nrEvents; i++){
		
		var dtstart = moment( startMoment ).add(i, unit); 
		var dtend = moment( endMoment ).add(i, unit); 

		dtstart.hours(startHours);
		dtstart.minutes(startMinutes);
		dtend.hours(endHours);
		dtend.minutes(endMinutes);

		if(!dtstart || !dtend ) {
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			continue;
		}
		
		var eventTime = [ dtstart,dtend ];
		dates.push( eventTime );
	}
	
	return(dates);

};
Template.event.events({
	'click button.eventDelete': function () {
		if (pleaseLogin()) return;
		if (confirm('Delete event "'+this.title+'"?')) {
			var title = this.title;
			var course = this.course_id;
			Meteor.call('removeEvent', this._id, function (error, eventRemoved){
				if (eventRemoved) {
					addMessage(mf('event.removed', { TITLE: title }, 'Sucessfully removed event "{TITLE}".'), 'success');
					if (course) Router.go('showCourse', { _id: course });
				} else {
					addMessage(mf('event.remove.error', { TITLE: title }, 'Error during removal of event "{TITLE}".'));
				}
			});
			Template.instance().editing.set(false);
		}
	},
	
	'click button.eventEdit': function (event, template) {
		if (pleaseLogin()) return;
		Template.instance().editing.set(true);
		
		var eventId = this._id;
		var repEventId = this.replicaOf;
	
		//find if these events have replicas or if whether this event is replicated.
		Meteor.call('getReplicas', eventId, function (error, results){	
			if(error){template.replicasExist.set(false);}
			else if( results > 0 || repEventId != undefined ){
				template.replicasExist.set(true);
			}else{
				template.replicasExist.set(false);		
			}
		});		
		
		console.log("in the first moment, replicas do exist for some millis anyway, then these ghosts disapear, isn't that true?  - "+Template.instance().replicasExist.get() );
	},
	
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
			if (fileRemoved) addMessage(mf('file.removed', { FILENAME:filename }, 'Sucessfully removed file {FILENAME}.'));
			else addMessage(mf('file.removed.fail', { FILENAME:filename }, "Couldn't remove file {FILENAME}."));
		});		
	},
	
	
	'click button.saveEditEvent': function(event, template) {
		if (pleaseLogin()) return;

		var startMoment = getEventStartMoment(template);
		if(!startMoment) {
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			return null;
		}
		var duration = getEventDuration(template);
		//we need this check because duration is not an event property and it is reset to null after first save
		if(!duration){
			setDurationInTemplate(template);
			duration = getEventDuration(template);
		}
		var endMoment = calculateEndMoment(startMoment, duration);
		var nowMoment = moment();
		if (startMoment.diff(nowMoment)<0) {
			alert("Date must be in future");
			return;
		}
		
		//todo:detect changed fields
		
		var editevent = {
			title: template.$('#edit_event_title').val(),
			description: template.$('#edit_event_description').html(),
			location: template.$('#edit_event_location').val(),
			room: template.$('#edit_event_room').val(),
			startdate: startMoment.toDate(),
			enddate: endMoment.toDate(),
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
		if (isNew) {
			eventId = '';
			
			if (this.course_id) {
				var course = Courses.findOne(this.course_id);
				editevent.region = course.region;
				editevent.course_id = this.course_id;
			} else {
				editevent.region = template.$('.region_select').val();
			}
		}
		
		var updateReplicas = template.$("input[name='updateReplicas']").is(':checked');
		
		if(updateReplicas && this.replicaOf != undefined){	
			editevent.replicaOf = this.replicaOf;		
		}
		
		Meteor.call('saveEvent', eventId, editevent, function(error, eventId) {
			if (error) {
				addMessage(mf('event.saving.error', { ERROR: error }, 'Saving the event went wrong! Sorry about this. We encountered the following error: {ERROR}'));
			} else {
				
				//update replicas too
				//check if "update replicas" flag is set here, and if yes, update them
				if(updateReplicas){
					
					//we need this to identify the event that this is a replica of, and apply changes to that too
					
					
					Meteor.call('updateReplicas', eventId, editevent, function(error, eventId) {
						if (error) {	
							addMessage(mf('event.replicate_update.error', { TITLE: editevent.title }, 'Failed to update replicas of "{TITLE}". You may want to do it manually.'));
						}
						else{
							addMessage(mf('event.edit.replicates.success', { TITLE: editevent.title }, 'Replicas of "{TITLE}" also updated.'), 'success');
						}		
					});
				}
			
				
				if (isNew) Router.go('showEvent', { _id: eventId });
					else addMessage(mf('event.saving.success', { TITLE: editevent.title }, 'Saved changes to event "{TITLE}".'), 'success');
				template.editing.set(false);
			}
		});
	},
	
	'click button.eventReplicate': function (event, template) {
		//get all startDates where the event should be created
		//this does not do anything yet other than generating the start-end times for a given period
		
		var dates = getEventFrequency(template);
		var success = true;	
		$.each( dates, function( i,eventTime ){
			
			/*create a new event for each time interval */

			/*don't replicate the event if it is set for the same day*/
			if( template.data.startdate.toDateString() == eventTime[0].toDate().toDateString() ){
				console.error( "replica on same day");
				console.error( template.data.startdate.toString() + " - " + eventTime[0].toDate().toString()  );
				return true;
			}
			
			
			var replicaEvent = {

				title: template.data.title,
				description: template.data.description,
				location: template.data.location,
				room: template.data.room, //|| '',
				startdate: eventTime[0].toDate(),
				enddate: eventTime[1].toDate(),
				files: template.data.files  || new Array(),
				mentors: template.data.mentors  ||  new Array(),
				host: template.data.host ||  new Array(),
				region: template.data.region || Session.get('region'),
				replicaOf: template.data.replicaOf || template.data._id, // delegate the same replicaOf ID for this replica if the replicated event is also a replica
			};
		
			var course_id = template.data.course_id;
			if(course_id){
				replicaEvent.course_id  = course_id; 
			}

			var eventId = '';
				
			Meteor.call('saveEvent', eventId, replicaEvent, function(error, eventId) {
				if (error) {
					addMessage(mf('event.replicate.error', { ERROR: error }, 'Replicating the event went wrong! Sorry about this. We encountered the following error: {ERROR}'));
					success = false;
				} else {
				}
			});
		
		
		});
		if(success){
			template.$('div#eventReplicationMenu').slideUp(300);
			addMessage(mf('event.replicate.success', { TITLE: template.data.title }, 'Replicated event "{TITLE}".'));
			Router.go('showEvent', { _id: template.data._id });
		}
			
	},
	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		Template.instance().editing.set(false);
	},

	'click .toggle_duration': function(event, template){

		template.$('.show_time_end').toggle(300);
		template.$('.show_duration').toggle(300);
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

	'change #edit_event_duration, change #edit_event_starttime': function(event, template) {
		var startMoment = getEventStartMoment(template);
		var duration = getEventDuration(template);
		var endMoment = calculateEndMoment(startMoment, duration);
		template.$("#edit_event_endtime").val(endMoment.format("HH:mm"));

	},

	'change #edit_event_endtime': function(event, template) {
		setDurationInTemplate(template);

	}


});
