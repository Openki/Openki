"use strict";

Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id',
		template: 'course_event_detail',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('courses'),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			var event = Events.findOne({_id: this.params._id});
			if (!event) return {};
			var course = Courses.findOne({_id: event.course_id});
			return {
				current_event: event,
				course: course
			};
		}
	})
});


var editingEvent = function (event) {
	return Router.current().params.editEvent === event
};

Template.course_event_detail .helpers({
	editingEvent: editingEvent
});

