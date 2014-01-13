"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:name?',
		template: 'coursedetails',
		waitOn: function () {
			return Meteor.subscribe('categories');
			return Meteor.subscribe('courses');
			return Meteor.subscribe('users');
			return Meteor.subscribe('events');
		},
		data: function () {
			return Courses.findOne({_id: this.params._id})
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
})


Template.coursedetails.helpers({
	isEditing: function () {
		return Session.get("isEditing");
	},

	mayEdit: function() {
		var user = Meteor.user()
		return user && (user.isAdmin || hasRoleUser(this.members, 'team', user._id))
	},

    roleDetails: function() {
		var course = this
		return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
			var role = roletype.type
			if (course.roles.indexOf(role) !== -1) {
				goodroles.push({
					roletype: roletype,
					role: role,
					subscribed: hasRoleUser(course.members, role, Meteor.userId()),
					course: course
				})
			}
			return goodroles;
		}, []);
	}
})


Template.coursedetails.events({
	'click input.del': function () {
		if (confirm("wirklich?")) {
			Courses.remove(this._id);
			Router.navigate('/', true);
		}
	},
	'click input.edit': function () {
		// gehe in den edit-mode, siehe html
		if(Meteor.userId()) {
			Session.set("isEditing", true);
		}
		else {
			alert("Security robot say: sign in");
		}
	},
	'click input.subscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true)
	},
	'click input.unsubscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, false)
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
