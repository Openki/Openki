Template.course_events.events_list = function() {
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
};


Template.course_events.events_list_past = function() {
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
		Router.go(Router.current().route.name, Router.current().params, { query: { 'editEvent': 'new' } }) // Shirely, you know of a better way?
	},
	
	'click input.eventDelete': function () {
			if(!Meteor.userId()) {
				alert("Please log in!");
				return;}
		if (confirm("delete event "+"'"+this.event.title+"'"+"?")) {
			Events.remove(this.event._id);
		}
		goBase()
	},
	'click input.eventEdit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Router.go(Router.current().route.name, Router.current().params, { query: { 'editEvent': this.event._id } }) // Shirely, you know of a better way?
	}
})

Template.course_event.editingEvent = function (event) {
	return Router.current().params.editEvent === event
};
Template.course_events.editingEvent = function (event) {
	return Router.current().params.editEvent === event
};

