Template.courseCompact.helpers({
	ready: function() {
		var instance = Template.instance;
		return !instance.eventSub || instance.eventSub.ready();
	},

	courseState: function() {
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

	categorynames: function() {
		return Categories.find({_id: {$in: course.categories}}).map(function(cat) {
			return cat.name;
		}).join(', ');
	},

	hasUpcomingEvents: function() {
		return this.nextEvent;
	},

	courseRegion: function() {
		return this.region;
	}
});

Template.courseCompactRoles.helpers({
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

	userIsHost: function() {
		return hasRoleUser(this.members, 'host', Meteor.userId());
	},

	userInTeam: function() {
		return hasRoleUser(this.members, 'team', Meteor.userId());
	},

	userIsMenteor: function() {
		return hasRoleUser(this.members, 'mentor', Meteor.userId());
	},

	is_subscriber: function() {
		return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : '';
	}

});


Template.courseCompact.events({
	"mouseover .js-category-label": function(event, template){
		 template.$('.course-compact').addClass('elevate_child');
	},
	"mouseout .js-category-label": function(event, template){
		 template.$('.course-compact').removeClass('elevate_child');
	},
	"mouseover .js-group-label": function(event, template){
		 template.$('.course-compact').addClass('elevate_child');
	},
	"mouseout .js-group-label": function(event, template){
		 template.$('.course-compact').removeClass('elevate_child');
	}
});

Template.courseCompact.rendered = function() {
	this.$('.course-compact-name').dotdotdot({
		height: 60,
	});
};
