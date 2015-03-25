"use strict";


Router.map(function () {
	this.route('courses', {
		path: 'courses',
		template: 'coursepage',
		waitOn: function () {
			var region = Session.get('region')
			return [
				Meteor.subscribe('coursesFind', region, false, {}, 40),
				Meteor.subscribe('coursesFind', region, false, { missingTeam: true }, 5),
				Meteor.subscribe('coursesFind', region, false, { missingParticipants: true }, 5),
			]
		},
		data: function () {
			var region = Session.get('region')
			return {
				missing_organisator: coursesFind(region, false, { missingTeam: true }, 5),
				missing_subscribers: coursesFind(region, false, { missingParticipants: true }, 5),
				all_courses: coursesFind(region, false, {}, 36)
			};
		},
		onAfterAction: function() {
			document.title = webpagename + 'Courselist'
		},
	})
})


Template.course.helpers({
	requiresMentor: function() {
		if (!this.roles) return false;
		return this.roles.indexOf('mentor') != -1
	},

	requiresHost: function() {
		if (!this.roles) return false;
		return this.roles.indexOf('host') != -1
	},

	needsTeam: function() {
		return !hasRole(this.members, 'team')
	},

	needsMentor: function() {
		return !hasRole(this.members, 'mentor')
	},

	needsHost: function() {
		return !hasRole(this.members, 'host')
	},

	is_host: function() {
		return hasRoleUser(this.members, 'host', Meteor.userId())
	},

	is_team: function() {
		return hasRoleUser(this.members, 'team', Meteor.userId())
	},

	is_mentor: function() {
		return hasRoleUser(this.members, 'mentor', Meteor.userId())
	},

	coursestate: function() {
		var today = new Date();
		
		Meteor.subscribe('nextEvent', this._id);
		
		var upcoming = Events.find({course_id: this._id, startdate: {$gt:today}}).count() > 0;
		if (upcoming) return 'hasupcomingevents';
		
		var past = Events.find({course_id: this._id, startdate: {$lt:today}}).count() > 0
		if (past) return 'haspastevents';
						
		return 'proposal';
	},

	is_subscriber: function() {
		return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : ''
	},

	categorynames: function() {
		return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
	},


	course_eventlist: function() {
		var today= new Date();
		return Events.find({course_id: this._id, startdate: {$gt:today}}, {sort: {startdate: 1}, limit: 1});
	},


	course_eventlist_hasmore: function() {
		var today= new Date();
		var eventcount = Events.find({course_id: this._id,startdate: {$gt:today}},{sort: {startdate: 1}}).count();
		return eventcount > 1 ? (eventcount-1)  : false
	},

	hasupcomingevents: function() {
		var today= new Date();
		return Events.find({course_id: this._id, startdate: {$gt:today}},{sort: {startdate: 1}}).count() > 0

	},
})

Template.course.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
	this.$('.ellipsis').dotdotdot({
		//CONFIGURATION GOES HERE
	});
}