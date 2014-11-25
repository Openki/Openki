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
	participant_status: function() {
		if (this.subscribers_min < 1) return 'ontheway';
		var ratio = this.roles.participant.subscribed.length / this.subscribers_min;
		if (ratio < 0.5) return 'no';
		if (ratio >= 1) return 'yes';
		return 'ontheway';
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

	TneedsHost: function() {
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
	},

	donator_status: function() {
		return this.roles.donator.subscribed.length > 0 ? 'yes' : 'no'
	},

	cook_status: function() {
		return this.roles.cook.subscribed.length > 0 ? 'yes' : 'no'
	},

	is_subscriber: function() {
		return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : ''
	},

	is_donator: function() {
		return this.roles.donator.subscribed.indexOf(Meteor.userId()) >= 0 ? true : false
	},

	is_cook: function() {
		return this.roles.cook.subscribed.indexOf(Meteor.userId()) >= 0 ? true : false
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