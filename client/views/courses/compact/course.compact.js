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
			return 'is-proposal';
		}
	},

	filterPreviewClasses: function() {
		var filterPreviewClasses = [];
		var course = this;

		var roles = _.map(Roles, function(role) { return role.type; });

		_.each(roles, function(role) {
			var roleDisengaged = !hasRole(course.members, role);
			if (course.roles.indexOf(role) >= 0 && roleDisengaged) {
				filterPreviewClasses.push('needs-role-' + role);
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
	}
});

Template.courseCompactEvent.helpers({
	roleIcon: (type) => _.findWhere(Roles, { type: type }).icon
});

Template.courseCompactRoles.helpers({
	requiresRole: function(role) {
		return this.roles.indexOf(role) >= 0;
	},

	participantClass() {
		let participantClass = 'course-compact-role-';

		const members = this.members;
		if (hasRoleUser(members, 'participant', Meteor.userId())) {
			participantClass += 'occupied-by-user';
		} else if (members.length) {
			participantClass += 'occupied';
		} else {
			participantClass += 'needed';
		}

		return participantClass;
	},

	participantTooltip() {
		let tooltip;
		const numMembers = this.members.length;
		const isParticipant = hasRoleUser(this.members, 'participant', Meteor.userId());

		if (numMembers === 1 && isParticipant) {
			tooltip = mf(
				'course.compact.membersCountOwnOnly',
				'You are the only participant'
			);
		} else {
			tooltip = mf(
				'course.compact.membersCount',
				{ NUM: numMembers },
				'Has {NUM, plural, =0 {no participants} one {one participant} other {# participants}}'
			);

			if (numMembers > 1 && isParticipant) {
				tooltip += ' ';
				tooltip += mf(
					'course.compact.membersCountOwn',
					'and you are one of them'
				);
			}
		}

		return tooltip;
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

	roleIcon: (type) => _.findWhere(Roles, { type: type }).icon
});

Template.courseCompact.events({
	'mouseover .js-group-label, mouseout .js-group-label': function(e, instance) {
		instance.$('.course-compact').toggleClass('elevate_child');
	},

	'mouseover .js-category-label, mouseout .js-category-label': function(e, instance) {
		instance.$('.course-compact').toggleClass('elevate_child');
	}
});

Template.courseCompact.onRendered(function() {
	this.$('.course-compact-title').dotdotdot();
});
