Template.course_events.events_list = function() {
    var course=this.course;
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
};


Template.course_events.events_list_past = function() {
    var course=this.course;
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
};


Template.course_events.new_event = function() {
	return {course: this.course, event: {}}
}


Template.course_events.events({

	'click input.addEvent': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Session.set("isAddingEvent", true);
		Session.set("isEditingEvent", false);
	},
	'click input.cancelEditEvent': function () {
		Session.set("isEditingEvent", false);
		Session.set("isAddingEvent", false);
	},
	
	'click input.eventDelete': function () {
			if(!Meteor.userId()) {
				alert("Please log in!");
				return;}
		if (confirm("delete event "+"'"+this.event.title+"'"+"?")) {
			Events.remove(this.event._id);
		}
	},
	'click input.eventEdit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Session.set("isEditingEvent", this.event._id);
		Session.set("isAddingEvent", false);
	}
})

Template.course_events.isAddingEvent = function () {
	return Session.get("isAddingEvent");
};

Template.course_event.isEditingEvent = function () {
	if(Session.get("isEditingEvent")){
		return Session.get("isEditingEvent")===this.event._id;
	}
};

