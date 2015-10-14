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
		var pastEvents = Events.find({course_id:course._id, start: {$lt:today}}, {sort: {start: 1}}).map(function(event){
			var isCurrent = false;
			if(current_event && current_event._id==event._id) isCurrent=true;
			return {
				course: course,
				event: event,
				isCurrent: isCurrent
			}
		});
		/// isert empty element to fill up 2-column list
		if (pastEvents.length % 2 == 1) {
			pastEvents.unshift({ empty: true });
		}
		return pastEvents;
	}
});

Template.course_events.events({
	'click button.eventEdit': function () {
		Router.go('showEvent', { _id: 'create' }, { query: { courseId: this.course._id } });
	}
});

Template.course_events.rendered = function() {
	var scrollableContainer = this.$(".course_events")

	if (scrollableContainer.length == 0) return; // No events

	scrollableContainer.scroll(function (event) {
		var trueHeight = scrollableContainer[0].scrollHeight - scrollableContainer.height()
		var reactiveArea = trueHeight - 1

		$(".fade_effect_top").fadeIn(200);
		$(".fade_effect_bottom").fadeIn(200);

		if (scrollableContainer.scrollTop() > reactiveArea) {
			$(".fade_effect_bottom").fadeOut(200);
		}
		else if (scrollableContainer.scrollTop() < 1) {
			$(".fade_effect_top").fadeOut(200);
		}
	});
	scrollableContainer.scrollTop(this.$("hr.now").offset().top-scrollableContainer.offset().top); //halp
};

Template.course.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
