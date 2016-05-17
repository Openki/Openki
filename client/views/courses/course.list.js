

Router.map(function () {
	this.route('courses', {
		path: 'courses',
		template: 'coursepage',
		waitOn: function() {
			var region = Session.get('region');
			return [
				Meteor.subscribe('coursesFind', { region: region }, 40),
				Meteor.subscribe('coursesFind', { region: region, missingTeam: true }, 5),
				Meteor.subscribe('coursesFind', { region: region, missingParticipants: true }, 5),
			];
		},
		data: function () {
			var region = Session.get('region');
			return {
				all_courses:         coursesFind({ region: region }, 36),
				missing_organizer: coursesFind({ region: region, missingTeam: true }, 5),
				missing_subscribers: coursesFind({ region: region, missingParticipants: true }, 5)
			};
		},
		onAfterAction: function() {
			document.title = webpagename + 'Courselist';
		},
	});
});


Template.course.helpers({
	coursestate: function() {
		if (this.nextEvent) return 'hasupcomingevents';
		if (this.lastEvent) return 'haspastevents';
		return 'proposal';
	},

	needsMentor: function() {
		if (!this.roles) return false;
		else if (this.roles.indexOf('mentor') != -1)
			return !hasRole(this.members, 'mentor');
	},

	needsHost: function() {
		if (!this.roles) return false;
		else if (this.roles.indexOf('host') != -1)
			return !hasRole(this.members, 'host');
	},

	additionalEvents: function() {
		return Math.max(this.futureEvents - 1, 0);
	},
});

Template.courseStatus.helpers({
	requiresMentor: function() {
		if (!this.roles) return false;
		return this.roles.indexOf('mentor') != -1;
	},

	requiresHost: function() {
		if (!this.roles) return false;
		return this.roles.indexOf('host') != -1;
	},

	needsTeam: function() {
		return !hasRole(this.members, 'team');
	},

	needsMentor: function() {
		return !hasRole(this.members, 'mentor');
	},

	needsHost: function() {
		return !hasRole(this.members, 'host');
	},

	is_host: function() {
		return hasRoleUser(this.members, 'host', Meteor.userId());
	},

	is_team: function() {
		return hasRoleUser(this.members, 'team', Meteor.userId());
	},

	is_mentor: function() {
		return hasRoleUser(this.members, 'mentor', Meteor.userId());
	},

	is_subscriber: function() {
		return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : '';
	}

});


Template.course.events({
	"mouseover a.category": function(event, template){
		 template.$('.courselist_course').addClass('elevate_child');
	},
	"mouseout a.category": function(event, template){
		 template.$('.courselist_course').removeClass('elevate_child');
	},
	"mouseover a.group": function(event, template){
		 template.$('.courselist_course').addClass('elevate_child');
	},
	"mouseout a.group": function(event, template){
		 template.$('.courselist_course').removeClass('elevate_child');
	}
});

Template.courseStatus.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};

Template.course.rendered = function() {
	this.$('.course-name').dotdotdot({
		height: 60,
	});
};
