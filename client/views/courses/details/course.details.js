"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'coursedetails',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('courseDetails', this.params._id),
				Meteor.subscribe('users'),
				Meteor.subscribe('events'),
				Meteor.subscribe('groups')
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			if (!course) return null;
			   
			var userId = Meteor.userId();
			var member = getMember(course.members, userId);
			return {
				edit: !!this.params.query.edit,
				roleDetails: loadroles(course),
				course: course,
				member: member
			};
		},
		onAfterAction: function() {
			var course = Courses.findOne({_id: this.params._id})
			if (!course) return; // wtf
			document.title = webpagename + 'Course: ' + course.name
		}
	})
	this.route('showCourseWiki', {
		path: 'course/:_id/:slug/wiki',
		template: 'coursewiki',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
			    Meteor.subscribe('courseDetails', this.params._id),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			return {
				course: course
			};
		}
	})

})

function loadroles(course) {
	var userId = Meteor.userId();
	return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
		var role = roletype.type
		var sub = hasRoleUser(course.members, role, userId);
		if (course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: !!sub,
				anonsub: sub == 'anon',
				course: course
			})
		}
		return goodroles;
	}, []);
}


Template.coursedetails.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return mayEdit(Meteor.user(), this);
	}
})


Template.coursedetails.events({
	'click input.del': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}

		if (confirm("really?")) {
			Courses.remove(this._id);
			Router.go('/');
		}
	},
	'click input.edit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Router.go('showCourse', this, { query: {edit: 'course'} })

	}
})

