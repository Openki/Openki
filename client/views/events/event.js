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
	isoDateFormat: function(date) {
		return moment(date).format("YYYY-MM-DD");
	},
	editing: function() {
		return this.new || Template.instance().editing.get();
	},
	frequencyOptions:function() {
	    return [{
	      frequency:0,
	      text:"once" 
	    },{
	      frequency:1,
	      text:"every day"
	    },{
	      frequency:7,
	      text:"once a week"
	    },{
	      frequency:30,
	      text:"once a month"
	    }];
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
	
	var startDate =  moment(template.$('#edit_event_startdate').val());	
	var nowMoment = moment();
	if (startDate.diff(nowMoment)<0) {
		alert("Date must be in future");
		return;
	}
	var endDate = moment(template.$('#edit_event_enddate').val());
	var frequency = template.$('#edit_frequency').val();
	var diffDays = endDate.diff(startDate, "days");
	

	var dates = [];
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
	
	
	
	for(var i = 0; i < nrEvents; i++){
		var dt = moment(startDate).add(i, unit); 
		var startTime = template.$('#edit_event_starttime').val();
		var startTimeParts = startTime.split(":");
		var minutes = startTimeParts[1];
		var hours = startTimeParts[0];
		var startMoment = dt;
		startMoment.hours(hours);
		startMoment.minutes(minutes);
	
		if(!startMoment) {
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			continue;
		}
		var duration = getEventDuration(template);
		var endMoment = calculateEndMoment(startMoment, duration);
		var eventTime = [ startMoment,endMoment ];
		dates.push( eventTime );
	}
	
	console.log( dates );
	return(dates);
	
	



};

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
		 
		template.$('button.eventFileUpload').toggle(300);
	}, 
		 
	'click button.eventFileUpload': function(event, template) {
	
		
		var fileEvent = $('.eventFileInput')[0].files;
		
		//FS.Utility.eachFile(fileEvent, function(file) {
	    $.each( fileEvent, function(i,file){  	
	    	console.log(file);
	        Files.insert(file, function (err, fileObj) {
		    	console.log(fileObj);
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

		//get all startDates where the event should be created
		//this does not do anything yet other than generating the start-end times for a given period
		var dates = getEventFrequency(template);
		
		$.each( dates, function( i,eventTime ){
				console.log(eventTime);
		});
			
		
		//this will not be necessary once the above is active
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
		};
		
		
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
				var course = Courses.findOne(this.course_id);
				editevent.region = course.region;
				editevent.course_id = this.course_id;
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
