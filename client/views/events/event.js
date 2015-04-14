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
	editing: function() {
		return this.new || Template.instance().editing.get();
	}
});

Template.eventDescritpionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
}

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
	
	'click button.fileDelete': function (event, instance) {
		
		var fileid = this._id;
		var eventid = instance.data._id;
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
	
	
	'click button.saveEditEvent': function(event, instance) {
		if (pleaseLogin()) return;

		function readTime(str, date) {
			/* Given str, set minute and hour of date
			 * given "08:00", "0800", "8.00", or "8" time is set to 8 hours 0 minutes
			 * given "08:30" "0830" "8.30" time is set to 8 hours 30 minutes
			 * given "08:30pm" "0830PM" "830p" time is set to 20 hours 30 minutes
			 * given "12:59AM" "12:59PM" time is set to 12 hours 59 minutes
			 * given "" or "my hovercraft is full of eels" time is not changed
			 * given "my 5 hovercraft are full of peels" time is set to 17 hours 0 minutes
			 * The behavior for values over 23 (hours) and 59 (minutes) is left as a surprise to the user.
			 */
			var digits = str.replace(/[^0-9]+/g, '');
			if (digits.length > 0) {
				if (digits.length < 3) {
					date.setMinutes(0);
					date.setHours(parseInt(digits, 10));
				} else {
					date.setMinutes(parseInt(digits.substr(-2), 10));
					date.setHours(parseInt(digits.substr(0, digits.length-2), 10));
				}
				if (str.toLowerCase().indexOf('p') != -1) {
					var hours = date.getHours();
					if (hours < 12) { // not correct for midn SHUT UP
						date.setHours(hours + 12);  // YOU'RE IN THE ARMY NOW
					}
				}
			}
		}

		// format startdate
		var startDateParts =  instance.$('#edit_event_startdate').val().split(".");
		if (!startDateParts[2]){
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			return;
		}
		var startdate = new Date(startDateParts[2], (startDateParts[1] - 1), startDateParts[0]);

		var startStr = instance.$('#edit_event_starttime').val();
		readTime(startStr, startdate);


		var now = new Date();
		if (startdate < now) {
			alert("Date must be in future");
			return;
		}

		var enddate = new Date(startdate.getTime()); // Rough approximation

		if (duration){
			var duration = instance.$('#edit_event_duration').val();
			enddate.setMinutes(enddate.getMinutes()+duration);	
		} else {
			var endStr = instance.$('#edit_event_endtime').val()
			readTime(endStr, enddate);

			if (enddate < startdate) {
				enddate = startdate // No questions asked
			}
		}

		var editevent = {
			title: instance.$('#edit_event_title').val(),
			description: instance.$('#edit_event_description').html(),
			location: instance.$('#edit_event_location').val(),
			room: instance.$('#edit_event_room').val(),
			startdate: startdate,
			enddate: enddate,
			files: this.files,
		}
		
		
		var fileList = instance.files;
		instance.files = null;

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
				instance.editing.set(false);
			}
		});
	},
	
	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		Template.instance().editing.set(false);
	},

	'click #toggle_duration': function(event){
		$('#show_time_end').toggle(300);
		$('#show_duration').toggle(300);
	},

});
