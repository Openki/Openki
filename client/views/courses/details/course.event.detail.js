"use strict";

Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id',
		template: 'course_event_detail',
		waitOn: function () {
			return Meteor.subscribe('categories');
			return Meteor.subscribe('courses');
			return Meteor.subscribe('users');
			return Meteor.subscribe('events');
		},
		data: function () {
			var event = Events.findOne({_id: this.params._id});
			var course = Courses.findOne({_id: event.course_id});
			return {
				current_event: event,
				course: course,
			};
		}
	})
})

