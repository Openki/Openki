"use strict";


Router.map(function () {
	this.route('courses', {
		path: 'courses',
		template: 'coursepage',
		waitOn: function () {
			var region = Session.get('region')
			return [
				Meteor.subscribe('coursesFind', { region: region }, 40),
				Meteor.subscribe('coursesFind', { region: region, missingTeam: true }, 5),
				Meteor.subscribe('coursesFind', { region: region, missingParticipants: true }, 5),
			]
		},
		data: function () {
			var region = Session.get('region')
			return {
				all_courses:         coursesFind({ region: region }, 36),
				missing_organisator: coursesFind({ region: region, missingTeam: true }, 5),
				missing_subscribers: coursesFind({ region: region, missingParticipants: true }, 5)
			};
		},
		onAfterAction: function() {
			document.title = webpagename + 'Courselist'
		},
	})
})


Template.course.helpers({
	ready: function() {
		return Template.instance().eventSub.ready();
	},

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
		
		var upcoming = Events.find({course_id: this._id, start: {$gt:today}}).count() > 0;
		if (upcoming) return 'hasupcomingevents';
		
		var past = Events.find({course_id: this._id, start: {$lt:today}}).count() > 0
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
		return Events.find({course_id: this._id, start: {$gt:today}}, {sort: {start: 1}, limit: 1});
	},


	course_eventlist_hasmore: function() {
		var today= new Date();
		var eventcount = Events.find({course_id: this._id, start: {$gt:today}}).count();
		return eventcount > 1 ? (eventcount-1)  : false
	},

	hasupcomingevents: function() {
		var today= new Date();
		return Events.find({course_id: this._id, start: {$gt:today}}).count() > 0;
	},
})

Template.course.onCreated(function() {
	this.eventSub = this.subscribe('nextEvent', this.data._id);
});

Template.course.rendered = function() {
	this.$('.ellipsis').dotdotdot({});
}

Template.courseStatus.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
}