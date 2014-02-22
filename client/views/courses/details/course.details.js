"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'coursedetails',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('courses'),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id});
			return {
				course: course
			};
		},
		after: function() {
			var course = Courses.findOne({_id: this.params._id})
			if (!course) return; // wtf
			document.title = webpagename + 'Course: ' + course.name
		},
		unload: function () {
			Session.set("isEditing", false);
			Session.set("isAddingEvent", false);
		}
	})
	this.route('showCourseWiki', {
		path: 'course/:_id/:slug/wiki',
		template: 'coursewiki',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('courses'),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			return {
				course: course
			};
		}/*,
		after: function() {
			var course = Courses.findOne({_id: this.params._id})
			if (!course) return; // wtf
			document.title = webpagename + 'Course: ' + course.name
		},
		unload: function () {
			Session.set("isEditing", false);
			Session.set("isAddingEvent", false);
		}*/
	})

})



Template.coursedetails.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return mayEdit(Meteor.user(), this);
	},

   	isEditing: function () {
		return Session.get("isEditing");
	}
})


Template.coursedetails.events({
	'click input.del': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}

		if (confirm("wirklich?")) {
			Courses.remove(this._id);
			Router.navigate('/', true);
		}
	},
	'click input.edit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		// gehe in den edit-mode, siehe html
		Session.set("isEditing", true);

	},
	'click input.subscribe': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}

		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, false)
	},
	'click input.subscribeAnon': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, true)
	},
	'click input.unsubscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, false, false)
	}
})


Template.coursedetails.isSubscribed = function () {
	//ist User im subscribers-Array?
	var course = this
	return course.subscribers.indexOf(Meteor.userId()) > -1
}

Template.coursedetails.isOrganisator = function () {
	var course = this
	if (!course.roles.team) return true;
	return course.roles.team.subscribed.indexOf(Meteor.userId()) != -1
}

Template.coursedetails.role_description = function(role) {
	return Roles.findOne({type: role}).description
}
