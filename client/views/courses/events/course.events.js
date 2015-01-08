"use strict";


Template.course_events.created = function() {
	this.adding = new ReactiveVar(false);
}
Template.course_events.helpers({
	events_list: function() {
		var course=this.course;
		if (!course) return [];
		var current_event=this.current_event;
		var today = new Date();
		return Events.find({course_id:course._id,startdate: {$gt:today}},{sort: {startdate: 1}}).map(function(event){
			var isCurrent = false;
			if(current_event && current_event._id==event._id) isCurrent=true;
			return {
				course: course, 
				event: event, 
				isCurrent: isCurrent
			}
		});
	},
	
	events_list_past: function() {
		var course=this.course;
		if (!course) return [];
		var current_event=this.current_event;
		var today = new Date();
		return Events.find({course_id:course._id,startdate: {$lt:today}},{sort: {startdate: -1}}).map(function(event){
			var isCurrent = false;
			if(current_event && current_event._id==event._id) isCurrent=true;
			return {
				course: course, 
				event: event, 
				isCurrent: isCurrent
			}
		});
	},
	
	new_event: function() {
		return {course: this.course, event: {}}
	},
	
	adding: function (event) {
		return Template.instance().adding.get();
	}
});


Template.course_events.events({
	'click input.addEvent': function () {
		Template.instance().adding.set(true);
	},
});

Template.course_event.events({
	'click input.eventDelete': function () {
			if(!Meteor.userId()) {
				alert("Please log in!");
				return;}
		if (confirm("delete event "+"'"+this.event.title+"'"+"?")) {
			Events.remove(this.event._id);
		}
		Template.instance().editing.set(false);
	},
	'click input.eventEdit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Template.instance().editing.set(this.event._id);
	},
	
	'click input.saveEditEvent': function(event, instance) {
		// format startdate
		var dateParts =  instance.$('#edit_event_startdate').val().split(".");
		
		if (!dateParts[2]){
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			return;
		}
		
		if(dateParts[2].toString().length==2) dateParts[2]=2000+dateParts[2]*1;

		if(instance.$('#edit_event_starttime').val()!=""){
			var timeParts =  $('#edit_event_starttime').val().split(":");
		}else{
			var timeParts =  [0,0];
		}
		
		var startdate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0],timeParts[0],timeParts[1])
		var now= new Date();
		
		
		if (startdate<now){
			alert("Date must be in future");
			return;
		}
		
		
		var editevent = {
			title: instance.$('#edit_event_title').val(),
			description: instance.$('#edit_event_description').val(),
			//mentors: $('input:checkbox:checked.edit_event_mentors').map(function(){ return this.name}).get(),
			//host: $('input:radio:checked.edit_event_host').val(),
			startdate: startdate
		}
		
		if (this.event._id) {
			editevent.time_lastedit= now
			Events.update(this.event._id, { $set: editevent })
		} else {
			if (this.course) editevent.course_id = this.course._id;
			editevent.createdBy = Meteor.userId()
			editevent.time_created = now
			editevent.time_lastedit= now
			
			Events.insert(editevent)
		}
		
		Template.instance().editing.set(false);
	},
	
	'click input.cancelEditEvent': function () {
		Template.instance().editing.set(false);
	}
});


Template.course_event.created = function() {
	this.editing = new ReactiveVar(false);
}

Template.course_event.helpers({
	editingEvent: function (event) {
		return Template.instance().editing.get() === event;
	}
});

