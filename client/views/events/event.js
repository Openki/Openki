"use strict";

Template.event.created = function() {
	this.editing = new ReactiveVar(false);
}

Template.eventPage.helpers({
	course: function() {
		var courseId = this.course_id;
		if (courseId) {
			// Very bad?
			Template.instance().subscribe('courseDetails', courseId);
			
			return Courses.findOne({_id: courseId});
		}
	}
});

Template.eventPage.helpers({
	isEvent: function() {
		return (this._id !== undefined) || this.new;
	}
});

Template.event.helpers({
	isoDateFormat: function(date)
	{
		return moment(date).format("YYYY-MM-DD");
	},
	editing: function() {
		return this.new || Template.instance().editing.get();
	}
});

Template.eventDescritpionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
}



var getEventStartMoment = function(template){
	var startMoment =  moment(template.$('#edit_event_startdate').val())
	var startTime = template.$('#edit_event_starttime').val();
	var startTimeParts = startTime.split(":");
	var minutes = startTimeParts[1];
	var hours = startTimeParts[0];
	startMoment.hours(hours);
	startMoment.minutes(minutes);
	return startMoment;
}

var getEventEndMoment = function(template){
	var startMoment = getEventStartMoment(template);
	var endMoment = moment(startMoment);
	var endtime = template.$('#edit_event_endtime').val();
	var endtimeParts = endtime.split(":");
	var minutes = endtimeParts[1];
	var hours = endtimeParts[0];
	endMoment.hours(hours);
	endMoment.minutes(minutes);
	if(endMoment.diff(startMoment)<0)
		endMoment.add(1,"day");

	return endMoment;
}
var getEventDuration = function(template){
	var duration = parseInt(template.$('#edit_event_duration').val(),10);

	return Math.max(0,duration);
}

var calculateEndMoment = function(startMoment, duration) {
	return moment(startMoment).add(duration, "minutes"); 
}

var setDurationInTemplate = function(template)
{
	var startMoment = getEventStartMoment(template);
	var endMoment = getEventEndMoment(template);
	var duration = endMoment.diff(startMoment, "minutes");
	template.$("#edit_event_duration").val(duration);
}

Template.event.onRendered(function(){
	setDurationInTemplate(this);
});

Template.event.events({
	'click button.eventDelete': function () {
		if (pleaseLogin()) return;
		if (confirm('Delete event "'+this.title+'"?')) {
			var title = this.title
			Meteor.call('removeEvent', this._id, function (error, eventRemoved){
				if (eventRemoved) addMessage(mf('event.removed', { TITLE: title }, 'Sucessfully removed event "{TITLE}".'));
				else console.log('An error Occured while deleting Event'+error);
			});
			Template.instance().editing.set(false);
		}
	},
	
	'click button.eventEdit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(true);
	},
	
		 
	'change .eventFileInput': function(event, template) {
		
		FS.Utility.eachFile(event, function(file) {
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
	          		template.files = fileList
	          	}
	        });
		});
	},
	
	'click button.fileDelete': function (event, template) {
		
		var fileid = this._id;
		var eventid = template.data._id;
		var filename = this.filename;
		//delete the actual file
		var fp = Files.remove(fileid)
		
		//hide file name
		var rowid = "tr#row-" + fileid;		
		$(rowid).hide();
		
		//remove file attribute from the event
		Meteor.call('removeFile', eventid, fileid, function (error, fileRemoved){
			if (fileRemoved) addMessage(mf('file.removed', { FILENAME:filename }, 'Sucessfully removed file {FILENAME}.'));
			else console.log('An error Occured while deleting Event'+error);
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
		var endMoment = calculateEndMoment(startMoment, duration);
		
		var nowMoment = moment();
		if (startMoment.diff(nowMoment)<0) {
			alert("Date must be in future");
			return;
		}

		


		var editevent = {
			title: template.$('#edit_event_title').val(),
			description: template.$('#edit_event_description').html(),
			location: template.$('#edit_event_location').val(),
			room: template.$('#edit_event_room').val(),
			startdate: startMoment.toDate(),
			enddate: endMoment.toDate(),
			files: this.files,
		}
		
		
		var fileList = template.files;
		template.files = null;

		//check if file object is stored in the template object
		if(fileList != null){
			var tmp = []				
			$.each( this.files, function( i,fileObj ){
				tmp.push( fileObj );
			});
			
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
				editevent.course_id = this.course._id;
				editevent.region = this.course.region;
			} else {
				editevent.region = Session.get('region');
			}
		}
		
		Meteor.call('saveEvent', eventId, editevent, function(error, eventId) {
			if (error) {
				addMessage(mf('event.saving.error', { ERROR: error }, 'Saving the event went wrong! Sorry about this. We encountered the following error: {ERROR}'));
			} else {
				if (isNew) Router.go('showEvent', { _id: eventId });
				else addMessage(mf('event.saving.success', { TITLE: editevent.title }, 'Saved changes to event "{TITLE}".'));
				template.editing.set(false);
			}
		});
	},
	
	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		Template.instance().editing.set(false);
	},

	'click .toggle_duration': function(event, template){

		template.$('.show_time_end').toggle(300);
		template.$('.show_duration').toggle(300);
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
