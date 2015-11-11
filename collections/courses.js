// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "categories"    -> [ID_categories]
// "tags"          -> List of Strings  (not used)
// "groups"        -> List ID_groups
// "description"   -> String
// "slug"          -> String
// "region"        -> ID_region
// "date"          -> Date             (what for?)
// "createdby"     -> ID_user
// "time_created"  -> Date
// "time_lastedit" -> Date
// "time_lastenrol"-> Date
// "roles"         -> [role-keys]
// "members"       -> [{"user":ID_user,"roles":[role-keys]},"comment":string]
// ===========================

Courses = new Meteor.Collection("Courses");


function addRole(course, role, user) {
	// Add the user as member if she's not listed yet
	Courses.update(
		{ _id: course._id, 'members.user': { $ne: user } },
		{ $addToSet: { 'members': { user: user, roles: [ role ]} }}
	);

	var result = Courses.update(
		{ _id: course._id, 'members.user': user },
		{ '$addToSet': { 'members.$.roles': role }}
	);

	if (result != 1) throw new Error("addRole affected "+result+" documents");
}


function removeRole(course, role, user) {
	var result = Courses.update(
		{ _id: course._id, 'members.user': user },
		{ '$pull': { 'members.$.roles': role }}
	);

	if (result != 1) throw new Error("removeRole affected "+result+" documents");

	// Housekeeping: Remove members that have no role left
	Courses.update(
		{ _id: course._id },
		{ $pull: { members: { roles: { $size: 0 } }}}
	);
}

hasRole = function(members, role) {
	if (!members) return false;
	var has = false;
	members.forEach(function(member) {
		if (member.roles.indexOf(role) !== -1) {
			has = true;
			return true;
		}
	})
	return has;
}

hasRoleUser = function(members, role, user) {
	var has = false;
	var loggeduser = Meteor.user()
	
	members.forEach(function(member) {
		if (loggeduser && loggeduser._id == user && loggeduser.anonId && loggeduser.anonId.indexOf(member.user) != -1) {
			if(member.roles.indexOf(role) !== -1) has = 'anon'
		}
	})
	
	members.forEach(function(member) {
		if (member.user == user) {
			if (member.roles.indexOf(role) !== -1) has = 'subscribed'
				return true;
		}
	})
	
	return has;
}

maySubscribe = function(operatorId, course, userId, role) {
	if (!userId) return false;

	// Do not allow subscribing when already subscribed
	if (hasRoleUser(course.members, role, userId)) return false;

	// Admins may do anything
	if (privileged(operatorId, 'admin')) {
		return true;
	}
	
	// The team role is restricted
	if ('team' === role) {
		// If there are no team-members, anybody can join
		if (!hasRole(course.members, 'team')) {
			return operatorId === userId;
		}
		
		// Only members of the team can take-on other people
		if (hasRoleUser(course.members, 'team', operatorId)) {
			// Only participating users can be drafted
			var candidateRoles = ['participant', 'mentor', 'host'];

			// In for a penny, in for a pound
			for (p in candidateRoles) {
				if (hasRoleUser(course.members, candidateRoles[p], userId)) return true;
			}
		}
		return false;
	}
	
	// The other roles can only be chosen by the users themselves
	if (operatorId !== userId) return false;
	
	return true;
}


coursesFind = function(filter, limit) {
	var find = {}
	if (filter.region && filter.region != 'all') find.region = filter.region;

	if (filter.upcomingEvent) {
		find['nextEvent'] = { $ne: null };
	}

	var mustHaveRoles = [];
	var missingRoles = [];

	if (filter.needsHost) {
		missingRoles.push('host'); 
		mustHaveRoles.push('host');
	}

	if (filter.needsMentor) {
		missingRoles.push('mentor');
		mustHaveRoles.push('mentor');
	}
	
	if (filter.missingTeam) {	
		missingRoles.push('team');
		// All courses have the team role so we don't need to restrict to those having it
	}

	if (filter.userInvolved) {
		find['members.user'] = filter.userInvolved;
	}
	
	if (filter.categories) {
		find.categories = { $all: filter.categories };
	}

	if (filter.group) {
		find.groups = filter.group;
	}
	
	if (missingRoles.length > 0) {
		find['members.roles'] = { $nin: missingRoles };
	}
	
	if (mustHaveRoles.length > 0) {
		find.roles = { $all: mustHaveRoles };
	}

	if (filter.search) {
		var searchTerms = filter.search.split(/\s+/);
		var searchQueries = _.map(searchTerms, function(searchTerm) {
			return { $or: [
				{ name: { $regex: escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: escapeRegex(searchTerm), $options: 'i' } }
			] }
		});

		find.$and = searchQueries;
	}
	var options = { limit: limit, sort: {time_lastedit: -1, time_created: -1} };
	return Courses.find(find, options);
} 


Meteor.methods({

	change_comment: function(courseId, comment) {
		check(courseId, String);
		check(comment, String);
		var course = Courses.findOne({_id: courseId})
		if (!course) throw new Meteor.Error(404, "Course not found");

		Courses.update(
			{ _id: course._id, 'members.user': Meteor.userId() },  //TODO: not allocated to anon user
			{ $set: { 'members.$.comment': comment } },
			checkUpdateOne
		);
	},
	
	add_role: function(courseId, userId, role, incognito) {
		check(courseId, String);
		check(userId, String);
		check(role, String);
		check(incognito, Boolean);
		
		var user = Meteor.users.findOne(userId);
		if (!user) throw new Meteor.Error(404, "User not found");
			   
		var operator = Meteor.user();
		if (!operator) throw new Meteor.Error(401, "please log in");
			   
		var forThemself = operator._id === user._id;
		if (!forThemself && incognito) {
			throw new Meteor.Error(401, "not permitted");
		}
		
		var course = Courses.findOne({_id: courseId});
		if (!course) throw new Meteor.Error(404, "Course not found");

		if (course.roles.indexOf(role) == -1) throw new Meteor.Error(404, "No role "+role);
		
		// Check permissions
		if (!maySubscribe(operator._id, course, user._id, role)) {
			throw new Meteor.Error(401, "not permitted");
		}

		// The subscriptionId is the user._id unless we're subscribing incognito
		var subscriptionId = false;
		
		if (incognito) {
			// Re-use anonId if already used on another role
			if (user.anonId) {
				_.each(course.members, function(member){
					if (user.anonId.indexOf(member.user) != -1) {
						subscriptionId = member.user;
					}
				});
			}
			
			if (!subscriptionId) {
				subscriptionId = Meteor.call('generateAnonId');
			}
		}

		if (!subscriptionId){
			subscriptionId = user._id;
		}

		addRole(course, role, subscriptionId);
		var time = new Date;
		Courses.update({_id: courseId}, { $set: {time_lastedit: time}}, checkUpdateOne);
	},

	remove_role: function(courseId, role) {
		check(role, String);
		check(courseId, String);

		var user = Meteor.user();
		if (!user) throw new Meteor.Error(401, "please log in");

		var course = Courses.findOne({_id: courseId});
		if (!course) throw new Meteor.Error(404, "Course not found");

		// The subscriptionId is the user._id unless we're delisting incognito
		var subscriptionId = false;

		_.each(course.members, function(member) {
			if (
				user.anonId
			 && user.anonId.indexOf(member.user) != -1
			 && (add || member.roles.indexOf(role) != -1)
			) {
				subscriptionId = member.user;
			}
		});

		if (!subscriptionId){
			subscriptionId = user._id;
		}

		removeRole(course, role, subscriptionId);
	},

	save_course: function(courseId, changes) {
		check(courseId, String);
		check(changes, {
			description: Match.Optional(String),
			categories:  Match.Optional([String]),
			name:        Match.Optional(String),
			region:      Match.Optional(String),
			roles:       Match.Optional(Object),
			groups:	     Match.Optional([String])
		});

		var user = Meteor.user();
		if (!user) {
		    if (Meteor.is_client) {
				pleaseLogin();
				return;
			} else {
				throw new Meteor.Error(401, "please log in");
			}
		}

		var course;
		var isNew = courseId.length == 0
		if (!isNew) {
			course = Courses.findOne({_id: courseId})
			if (!course) throw new Meteor.Error(404, "Course not found")
		}

 		var mayEdit = isNew || privileged(user, 'admin') || Courses.findOne({_id: courseId, members:{$elemMatch: { user: user._id, roles: 'team' }}})
		if (!mayEdit) throw new Meteor.Error(401, "edit not permitted")


		/* Changes we want to perform */
		var set = {}

		_.each(Roles.find().fetch(), function(roletype) {
			var type = roletype.type
			var should_have = roletype.preset || changes.roles && changes.roles[type]
			var have = !isNew && course.roles.indexOf(type) !== -1

			if (have && !should_have) {
				Courses.update(
					{ _id: courseId },
					{ $pull: { roles: type }},
					checkUpdateOne
				);
				
				// HACK
				// due to a mongo limitation we can't { $pull { 'members.roles': type } }
				// so we keep removing one by one until there are none left
				while(Courses.update(
					{ _id: courseId, "members.roles": type },
					{ $pull: { 'members.$.roles': type }}
				));
			}
			if (!have && should_have) {
				if (isNew) {
					set.roles = set.roles || []
					set.roles.push(type)
				} else {
					Courses.update(
						{ _id: courseId },
						{ $addToSet: { roles: type }},
						checkUpdateOne
					)
				}
			}
		})

		if (changes.description) {
			set.description = changes.description.substring(0, 640*1024) /* 640 k ought to be enough for everybody  -- Mao */
			if (Meteor.isServer) {
				set.description = saneHtml(set.description);
			}
		}

		if (changes.categories) set.categories = changes.categories.slice(0, 20)
		if (changes.name) {
		    set.name = saneText(changes.name).substring(0, 1000);
		    set.slug = getSlug(set.name);
		}

		set.time_lastedit = new Date
		if (isNew) {
			// You can add newly created courses to any group
			var tested_groups = [];
			if (changes.groups) {
				tested_groups = _.map(changes.groups, function(groupId) {
					var group = Groups.findOne(groupId);
					if (!group) throw new Meteor.Error(404, "no group with id "+groupId);
					return group._id;
				});
			}
			set.groups = tested_groups;

			/* region cannot be changed */
			var region = Regions.findOne({_id: changes.region})
			if (!region) throw Meteor.error(404, 'region missing');
			set.region = region._id

			/* When a course is created, the creator is automatically added as sole member of the team */
			set.members = [{ user: user._id, roles: ['team'], comment: '(has proposed this course)'}];
			set.createdby = user._id;
			set.time_created = new Date;
			courseId = Courses.insert(set, checkInsert);
		} else {
			Courses.update({ _id: courseId }, { $set: set }, checkUpdateOne);
		}

		return courseId;
	},
	
	remove_course: function(courseId) {
		var user = Meteor.user();
		var mayEdit = privileged(user, 'admin') || Courses.findOne({_id: courseId, members:{$elemMatch: { user: user._id, roles: 'team' }}});
		if (!mayEdit) throw new Meteor.Error(401, "edit not permitted");
		Events.remove({ course_id: courseId });
		Courses.remove(courseId);
	},

	// Update the nextEvent field for the courses matching the selector
	updateNextEvent: function(selector) {
		Courses.find(selector).forEach(function(course) {
			var nextEvent = Events.findOne(
				{course_id: course._id, start: {$gt: new Date()}},
				{sort: {start: 1}, fields: {start: 1, _id: 1}}
			);
			var lastEvent = Events.findOne(
				{course_id: course._id, start: {$lt: new Date()}},
				{sort: {start: -1}, fields: {start: 1, _id: 1}}
			);
			Courses.update(course._id, { $set: {
				nextEvent: nextEvent,
				lastEvent: lastEvent
			} });
		});
	}
});
