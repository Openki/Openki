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
			document.title = 'Course list - hmmmm'
		},
	})
})

/* ------------------------- Query / List ------------------------- */

// TODO: convert to lirary function or method

function get_courselist(listparameters){
	//return a course list
	var find ={};

	if(listparameters.courses_from_userid) {		// show courses that have something to do with userid
		find = _.extend(find, { $or : [
			{ "roles.team.subscribed" : listparameters.courses_from_userid},
			{ "roles.participant.subscribed" : listparameters.courses_from_userid},
			{ "roles.mentor.subscribed" : listparameters.courses_from_userid},
			{ "roles.host.subscribed" : listparameters.courses_from_userid},
			{ "roles.interested.subscribed" : listparameters.courses_from_userid}
		]
	})

	} else if(Session.get('region')) {
		find.region = Session.get('region')
	}
	if(listparameters.missing=="organisator") {
		// show courses with no organisator
		find = _.extend(find, {$where: "this.roles.team && this.roles.team.subscribed.length == 0"})
	}
	if(listparameters.missing=="subscribers") {
		// show courses with not enough subscribers
		find = _.extend(find, {$where: "this.roles.participant && this.roles.participant.subscribed.length < this.subscribers_min"} )
	}
	return Courses.find(find, {sort: {time_lastedit: -1, time_created: -1}});
}

// FIXME : should be elsewhere (in profile)

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

Template.course.team_status = function() {
	return this.roles.team.subscribed.length > 0 ? 'yes' : 'no'
}

Template.course.mentor_status = function() {
	return this.roles.mentor.subscribed.length > 0 ? 'yes' : 'no'
}

Template.course.host_status = function() {
	return this.roles.host.subscribed.length > 0 ? 'yes' : 'no'
}


// Idee für provisorische Darstellung:
// Wenn Teilnehmer / Mentor / etc: return "*", sonst nichts
Template.course.is_subscriber = function() {
	return this.roles.participant.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}

Template.course.is_host = function() {
	return this.roles.host.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}

Template.course.is_team = function() {
	return this.roles.team.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}

Template.course.is_mentor = function() {
	return this.roles.mentor.subscribed.indexOf(Meteor.userId()) >= 0 ? '*' : ''
}


Template.course.categorynames = function() {
	return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
}
