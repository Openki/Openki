// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "categories" -> [ID_categories]
// "tags" -> list ID_categories
// "description" -> string
// "slug" -> string
// "region" -> ID_region
// "date" -> timestamp     what for?
// "createdby" -> ID_users
// "time_created" -> timestamp
// "time_lastedit" -> timestamp
// "time_lastenrol" -> timestamp
// "roles" -> [role-keys]
// "members" -> [{"user":ID_user,"roles":[role-keys]},"comment":string]
// ===========================

Courses = new Meteor.Collection("Courses");


Courses.allow({
	remove: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	}
});


function addRole(course, role, user) {
	// Add the user as member if she's not listed yet
	Courses.update(
		{ _id: course._id, 'members.user': { $ne: user } },
		{ $addToSet: { 'members': { user: user, roles: [ role ]} }}
	);

	Courses.update(
		{ _id: course._id, 'members.user': user },
		{ '$addToSet': { 'members.$.roles': role }},
		checkUpdateOne
	);
}


function removeRole(course, role, user) {
	var result = Courses.update(
		{ _id: course._id, 'members.user': user },
		{ '$pull': { 'members.$.roles': role }},
		checkUpdateOne
	);

	// Housekeeping: Remove members that have no role left
	Courses.update(
		{ _id: course._id },
		{ $pull: { members: { roles: { $size: 0 } }}}
	)
}


coursesFind = function(region, query, filter, limit) {
	var find = {}
	if (region != 'all') find.region = region
	if (filter.hasUpcomingEvent) {
		var future_events = Events.find({startdate: {$gt: new Date()}}).fetch()
		var course_ids_with_future_events = _.pluck(future_events, 'course_id')
		find['_id'] = { $in: _.uniq(course_ids_with_future_events) }
	}
	if (filter.userInvolved) {
		find['members.user'] = filter.userInvolved;
	}
	
	if (filter.missingTeam) {	
		find['members.roles'] = { $ne: 'team' }
	}
	
	if (query) {
		var searchTerms = query.split(/\s+/);
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
	
	change_subscription: function(courseId, role, add, anon) {
		check(role, String)
		check(courseId, String)
		check(add, Boolean)
		check(anon, Boolean)

		var course = Courses.findOne({_id: courseId})
		if (!course) throw new Meteor.Error(404, "Course not found")
		var userId = false
		var user = Meteor.user();
		var remove = !add
		//See wheter to use an anonId
		if (remove || anon){
			_.each(course.members, function(member){
				if (user.anonId && user.anonId.indexOf(member.user) != -1 && (add || member.roles.indexOf(role) != -1)){
					userId=member.user
				}
			})
		}

		if (anon && !userId){
			userId = new Meteor.Collection.ObjectID()
			userId = 'Anon_' + userId._str
			Meteor.call('insert_anonId', userId)
		}
		if (!anon && !userId){
			userId = user._id
		}

		if (!userId) {
			// Oops
			if (Meteor.isClient) {
				pleaseLogin(); 
				return;
			} else {
				throw new Meteor.Error(401, "please log in")
			}
		}

		if (!course.roles.indexOf(role) == -1) throw new Meteor.Error(404, "No role "+role)

		if (add) {
			addRole(course, role, userId)
			var time = new Date
			Courses.update({_id: courseId}, { $set: {time_lastedit: time}}, checkUpdateOne)
		} else {
			removeRole(course, role, userId)
		}
	},

	save_course: function(courseId, changes) {
		check(courseId, String);
		check(changes, {
			description: Match.Optional(String),
			categories:  Match.Optional([String]),
			name:        Match.Optional(String),
			region:      Match.Optional(String),
			roles:       Match.Optional(Object)
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
					{ $pull: { roles: type, 'members.roles': type }},
					checkUpdateOne
				)
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
	}
});
