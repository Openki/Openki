"use strict";

Router.map(function () {
	this.route('courses', {
		path: 'courses',
		template: 'coursepage',
		waitOn: function () {
			return Meteor.subscribe('courses');
		},
		data: function () {
			return {
				missing_organisator: get_courselist({missing: "organisator"}).fetch(),
				missing_subscribers: get_courselist({missing: "subscribers"}),
				all_courses: get_courselist({})
			};
		},
		after: function() {
			document.title = webpagename + 'Courselist'
		},
	})
})

/* ------------------------- Query / List ------------------------- */

// TODO: convert to lirary function or method

function get_courselist(listparameters){
	//return a course list
	var find ={};

	if (listparameters.courses_from_userid) {
		// courses where given user is member
		find['members.user'] = listparameters.courses_from_userid
	}

	if (Session.get('region')) {
		find.region = Session.get('region')
	}

	if (listparameters.missing=="organisator") {
		// show courses with no organisator
		find['members.roles'] = { $ne: 'team' }
	}

	return Courses.find(find, {sort: {time_lastedit: -1, time_created: -1}});
}

// FIXME : should be elsewhere (in profile)

Template.userprofile.courses_from_userid = function() {
	return get_courselist({courses_from_userid: this._id});
}

Template.profile.courses_from_userid = function() {
	return get_courselist({courses_from_userid: Meteor.userId()});
}
/* ------------------------- User Helpers ------------------------- */


// Idee für CSS:
// jede funktion_status returnt entweder
// "yes", "no", "ontheway" oder "notexisting"
Template.course.participant_status = function() {
	if (this.subscribers_min < 1) return 'ontheway'
	var ratio = this.roles.participant.subscribed.length / this.subscribers_min
	if (ratio < 0.5) return 'no'
	if (ratio >= 1) return 'yes'
	return 'ontheway'
}

Template.course.requiresMentor = function() {
	return this.roles.indexOf('mentor') != -1
}

Template.course.requiresHost = function() {
	return this.roles.indexOf('host') != -1
}

Template.course.needsTeam = function() {
	return !hasRole(this.members, 'team')
}

Template.course.needsMentor = function() {
	return !hasRole(this.members, 'mentor')
}

Template.course.needsHost = function() {
	return !hasRole(this.members, 'host')
}

Template.course.donator_status = function() {
	return this.roles.donator.subscribed.length > 0 ? 'yes' : 'no'
}

Template.course.cook_status = function() {
	return this.roles.cook.subscribed.length > 0 ? 'yes' : 'no'
}

Template.course.is_subscriber = function() {
	return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : ''
}

Template.course.is_host = function() {
	return hasRoleUser(this.members, 'host', Meteor.userId())
}

Template.course.is_team = function() {
	return hasRoleUser(this.members, 'team', Meteor.userId())
}

Template.course.is_mentor = function() {
	return hasRoleUser(this.members, 'mentor', Meteor.userId())
}

Template.course.is_donator = function() {
	return this.roles.donator.subscribed.indexOf(Meteor.userId()) >= 0 ? true : false
}

Template.course.is_cook = function() {
	return this.roles.cook.subscribed.indexOf(Meteor.userId()) >= 0 ? true : false
}

Template.course.categorynames = function() {
	return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
}


Template.course.course_eventlist = function() {
	var today= new Date();
	return Events.find({course_id: this._id, startdate: {$gt:today}}, {sort: {startdate: 1}, limit: 1});
}


Template.course.course_eventlist_hasmore = function() {

	var today= new Date();
	var eventcount = Events.find({course_id: this._id,startdate: {$gt:today}},{sort: {startdate: 1}}).count();
	return eventcount > 1 ? (eventcount-1)  : false
}

Template.course.hasupcomingevents = function() {

	var today= new Date();
	return Events.find({course_id: this._id, startdate: {$gt:today}},{sort: {startdate: 1}}).count() > 0

}

Template.course.coursestate = function() {

	var today = new Date();
	var upcoming = Events.find({course_id: this._id, startdate: {$gt:today}}).count() > 0
	var past = Events.find({course_id: this._id, startdate: {$lt:today}}).count() > 0

	if(upcoming || past){
		if(upcoming){
			return "hasupcomingevents"
		}else{
			return "haspastevents"
		}
	}else{
		return "proposal"
	}
}

