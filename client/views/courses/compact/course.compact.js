Template.courseCompact.helpers({
	ready: function() {
		var instance = Template.instance;
		return !instance.eventSub || instance.eventSub.ready();
	},

	courseState: function() {
		if (this.nextEvent) return 'has-upcoming-events';
		if (this.lastEvent) return 'has-past-events';
		return 'proposal';
	},

	mainCategoryIndices: function() {
		var mainCategoryIndices = [];
		_.each(this.categories, function(courseCategory) {
			var mainCategory = _.find(Categories, function(category) {
				return category.name == courseCategory;
			});
			if (mainCategory) {
				mainCategoryIndices.push(Categories.indexOf(mainCategory));
			}
		});

		return mainCategoryIndices;
	},

	mainCategories: function() {
		var mainCategories = [];
		_.each(this.categories, function(courseCategory) {
			var mainCategory = _.find(Categories, function(category) {
				return category.name == courseCategory;
			});
			if (mainCategory) mainCategories.push(mainCategory);
		});

		return mainCategories;
	},

	needsRole: function(role) {
		var courseRoles = this.roles;
		if (!courseRoles) {
			return false;
		} else if (courseRoles.indexOf(role) != -1){
			return !hasRole(this.members, role);
		}
	},

	hasUpcomingEvents: function() {
		return this.nextEvent;
	},

	courseRegionId: function() {
		return this.region;
	}
});

Template.courseCompactRoles.helpers({
	maxRoles: function() {
		return Roles.length - 1; // -1 because we don't show participants role
	},

	requiresRole: function(role) {
		var courseRoles = this.roles;
		if (!courseRoles) return false;
		return courseRoles.indexOf(role) != -1;
	},

	needsRole: function(role) {
		return !hasRole(this.members, role);
	},

	userHasRole: function (role) {
		return hasRoleUser(this.members, role, Meteor.userId());
	}
});


Template.courseCompact.events({
	"mouseover .js-group-label": function(event, template){
		 template.$('.course-compact').addClass('elevate_child');
	},

	"mouseout .js-group-label": function(event, template){
		 template.$('.course-compact').removeClass('elevate_child');
	}
});

Template.courseCompact.rendered = function() {
	this.$('.course-compact-title').dotdotdot();
};
