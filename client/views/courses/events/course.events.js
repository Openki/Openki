"use strict";

Template.course_events.helpers({
	mayAdd: function() {
		return hasRoleUser(this.course.members, 'team', Meteor.userId());
	},
	
	events_list: function() {
		var course=this.course;
		if (!course) return [];
		var current_event=this.current_event;
		var today = new Date();
		return Events.find({course_id:course._id, start: {$gt:today}}, {sort: {start: 1}}).map(function(event){
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
		return Events.find({course_id:course._id, start: {$lt:today}}, {sort: {start: -1}}).map(function(event){
			var isCurrent = false;
			if(current_event && current_event._id==event._id) isCurrent=true;
			return {
				course: course,
				event: event,
				isCurrent: isCurrent
			}
		});
	}
});

Template.course_events.events({
	'click button.eventEdit': function () {
		Router.go('showEvent', { _id: 'create' }, { query: { courseId: this.course._id } });
	}
});

Template.course.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
}
