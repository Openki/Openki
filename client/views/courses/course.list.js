

Router.map(function () {
	this.route('courses', {
		path: 'courses',
		template: 'coursepage',
		waitOn: function() {
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
				missing_organizer: coursesFind({ region: region, missingTeam: true }, 5),
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
		var instance = Template.instance;
		return !instance.eventSub || instance.eventSub.ready();
	},

	coursestate: function() {
		var today = new Date();

		var upcoming = this.nextevent;
		if (this.nextEvent) return 'hasupcomingevents';

		if (this.lastEvent) return 'haspastevents';

		return 'proposal';
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
});

Template.courseStatus.helpers({
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

	is_subscriber: function() {
		return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : ''
	}

});

Template.course.onCreated(function() {
	if (this.data.nextEvent) {
		this.eventSub = miniSubs.subscribe('event', this.data.nextEvent._id);
	}
});

Template.course.events({
	"mouseover a.category": function(event, template){
		 template.$('.courselist_course').addClass('category-focus-mode');
	},
	"mouseout a.category": function(event, template){
		 template.$('.courselist_course').removeClass('category-focus-mode');
	},
	"mouseover a.group": function(event, template){
		 template.$('.courselist_course').addClass('category-focus-mode');
	},
	"mouseout a.group": function(event, template){
		 template.$('.courselist_course').removeClass('category-focus-mode');
	}
});

Template.courseStatus.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
}

Template.course.rendered = function() {
	this.$('.course-name').dotdotdot({
		height: 60,
	});
	this.$('.course_categories').dotdotdot({
		height: 60,
	})
};
