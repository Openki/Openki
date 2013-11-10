"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id',
		template: 'coursedetails',
		waitOn: function () {
			return Meteor.subscribe('categories');
			return Meteor.subscribe('courses');
			return Meteor.subscribe('users');
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			return {
				course: course,
				subscribers: prepare_subscribers(course)
			};
		},
		after: function() {
			var course = Courses.findOne({_id: this.params._id})
			if (!course) return; // wtf
			document.title = 'Course ' + course.name + '- hmmmm'
		},
		unload: function () {
			Session.set("isEditing", false);
		}
	})
})


Template.coursedetails.isEditing = function () {
	return Session.get("isEditing");
};


Template.coursedetails.events({

	'click input.del': function () {
		if (confirm("wirklich?")) {
			Courses.remove(this._id);
			Router.navigate('/', true);
		}
	},

    'click input.edit': function () {
      	// gehe in den edit-mode, siehe html
		if(Meteor.userId())
			Session.set("isEditing", true);
		else
			alert("Security robot say: sign in");
    },

    'click input.subscribe': function () {
    	Meteor.call("change_subscription", this.course._id, this.roletype.type, true)
    },

    'click input.unsubscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, false)
    }
})


// nur für css

  Template.coursedetails.subscribers_status = function() {
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
  }

Template.coursedetails.roleDetails = function(roles) {
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
	return course.organisator==Meteor.userId()
}

Template.coursedetails.role_description = function(role) {
	return Roles.findOne({type: role}).description
}
