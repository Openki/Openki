"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug',
		template: 'coursedetails',
		waitOn: function () {
			return Meteor.subscribe('categories');
			return Meteor.subscribe('courses');
			return Meteor.subscribe('users');
			return Meteor.subscribe('events');
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			// course.nameY = course.name.replace(/[^\w\s]/gi, '-').replace(/[_\s]/g, '_') //FIXME: doesn't work!
			 console.log(course)
			return {
				course: course,
				subscribers: prepare_subscribers(course),
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
		path: 'course/:_id/:slug?/wiki',
		template: 'coursewiki',
		/*waitOn: function () {
			return Meteor.subscribe('categories');
			return Meteor.subscribe('courses');
			return Meteor.subscribe('users');
			return Meteor.subscribe('events');
		},*/
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			// course.nameY = course.name.replace(/[^\w\s]/gi, '-').replace(/[_\s]/g, '_') //FIXME: doesn't work!
			// console.log(course.nameY)
			return {
				course: course,
				subscribers: prepare_subscribers(course),
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


Template.coursedetails.helpers({
	isEditing: function () {
		return Session.get("isEditing");
	},

	mayEdit: function() {
		var user = Meteor.user()
		return user && (user.isAdmin || this.roles.team.subscribed.indexOf(user._id) >= 0)
	},
	
	subscribers_status: function() {
		//CSS status: genug anmeldungen? "ok" "notyet"
		var course = this
		if(course){
			if(course.subscribers){
				if(course.subscribers.length>=course.subscribers_min){
					return "ok";
				}else{
					return "notyet";
				}
			}
		}
	},

    roleDetails: function(roles) {
		var course = this
		return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
			var role = roles[roletype.type]
			if (role) {
				goodroles.push({
					roletype: roletype,
					role: role,
					subscribed: role.subscribed.indexOf(Meteor.userId()) >= 0,
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


function prepare_subscribers(course) {
	if (!course) return; // Wa?
	var subscribers = {}
	var sublist = []
	_.each(course.roles, function (role, type) {
		_.each(role.subscribed, function (userid) {
			var user = Meteor.users.findOne({_id: userid})
			if (!user) return;
			var userdata = subscribers[userid]
			if (!userdata) {
				userdata = {}
				userdata.name = user.username
				userdata.id = user._id
				userdata.roles = []
				subscribers[userid] = userdata
				sublist.push(userdata)
			}
			userdata.roles.push(type)
		})
	})
	return sublist;
}


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
