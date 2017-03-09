Template.courseCompact.onCreated(function() {
	var instance = this;
	var course = instance.data;

	var mainCategories = [];
	_.each(course.categories, function(courseCategory) {
		var mainCategory = _.find(Categories, function(category) {
			return category.name == courseCategory;
		});
		if (mainCategory) mainCategories.push(mainCategory);
	});

	instance.mainCategories = mainCategories;
	instance.mainCategoriesCount = mainCategories.length;
});

Template.courseCompact.helpers({
	ready: function() {
		var instance = Template.instance;
		return !instance.eventSub || instance.eventSub.ready();
	},

	courseState: function() {
		if (this.nextEvent) {
			return 'has-upcoming-events';
		} else if (this.lastEvent) {
			return 'has-past-events';
		} else {
			return 'proposal';
		}
	},

	filterPreviewClasses: function() {
		var filterPreviewClasses = [];
		var course = this;

		var roles = _.map(Roles, function(role) { return role.type; });

		_.each(roles, function(role) {
			var roleDisengaged = !hasRole(course.members, role);
			if (course.roles.indexOf(role) >= 0 && roleDisengaged) {
				filterPreviewClasses.push('needs-' + role);
			}
		});

		_.each(course.categories, function(category) {
			filterPreviewClasses.push('category-' + category);
		});

		_.each(course.groups, function(group) {
			filterPreviewClasses.push('group-' + group);
		});

		filterPreviewClasses.push('region-' + course.region);

		return filterPreviewClasses.join(' ');
	},

	courseCategoryIdentifier: function() {
		var instance = Template.instance();
		var mainCategories = instance.mainCategories;
		var mainCategoriesCount = instance.mainCategoriesCount;

		if (!mainCategoriesCount) return 'no-category';

		// limit number of main categories taken into account
		mainCategories = mainCategories.slice(0, 2);

		var mainCategoryIdentifiers = _.map(mainCategories, function(mainCategory) {
			return mainCategory._id;
		});

		// calculate identifier for if the course has more than one main category
		var courseCategoryIdentifier = _.reduce(mainCategoryIdentifiers, function(a, b) {
			return a + b * 10;
		});

		return courseCategoryIdentifier;
	},

	mainCategories: function(limit) {
		var instance = Template.instance();
		var mainCategories = instance.mainCategories;

		return mainCategories.slice(0, limit);
	},

	multipleMainCategories: function() {
		var instance = Template.instance();
		var mainCategoriesCount = instance.mainCategoriesCount;

		return mainCategoriesCount > 1;
	},

	categoryIdentifier: function() {
		return Categories.indexOf(this) + 1;
	}
});

Template.courseCompactRoles.helpers({
	maxRoles: function() {
		return Roles.length - 1; // -1 because we don't show participants role
	},

	requiresRole: function(role) {
		return this.roles.indexOf(role) >= 0;
	},

	roleStateClass: function(role) {
		var roleStateClass = 'course-compact-role-';
		if (!hasRole(this.members, role)) {
			roleStateClass += 'needed';
		} else if (hasRoleUser(this.members, role, Meteor.userId())) {
			roleStateClass += 'occupied-by-user';
		} else {
			roleStateClass += 'occupied';
		}

		return roleStateClass;
	},

	roleStateTooltip: function(role) {
		var roleStateTooltip;

		var tooltips = {
			'team':
				{ needed: mf('course.list.status_titles.needs_organizer', 'Needs an organizer')
				, occupied: mf('course.list.status_titles.has_team', 'Has a organizer-team')
				, occupiedByUser: mf('course.list.status_titles.u_are_organizer', 'You are organizer')
				},
			'mentor':
				{ needed: mf('course.list.status_titles.needs_mentor', 'Needs a mentor')
				, occupied: mf('course.list.status_titles.has_mentor', 'Has a mentor')
				, occupiedByUser: mf('course.list.status_titles.u_are_mentor', 'You are mentor')
				},
			'host':
				{ needed: mf('course.list.status_titles.needs_host', 'Needs a host')
				, occupied: mf('course.list.status_titles.has_host', 'Has a host')
				, occupiedByUser: mf('course.list.status_titles.u_are_host', 'You are host')
				}
		};

		if (!hasRole(this.members, role)) {
			roleStateTooltip = tooltips[role].needed;
		} else if (hasRoleUser(this.members, role, Meteor.userId())) {
			roleStateTooltip = tooltips[role].occupiedByUser;
		} else {
			roleStateTooltip = tooltips[role].occupied;
		}

		return roleStateTooltip;
	},

	roleIcon: function(roletype) {
		var role = _.find(Roles, function(role) {
			return role.type == roletype;
		});
		return role.icon;
	}
});

Template.courseCompact.events({
	'mouseover .js-group-label, mouseout .js-group-label': function(e, instance) {
		instance.$('.course-compact').toggleClass('elevate_child');
	}
});

Template.courseCompact.onRendered(function() {
	this.$('.course-compact-title').dotdotdot();
});
