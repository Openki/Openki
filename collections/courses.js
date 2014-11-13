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


function addRole(course, role, user, comment) {
	// Add the user as member if she's not listed yet
	Courses.update(
		{ _id: course._id, 'members.user': { $ne: user } },
		{ $addToSet: { 'members': { user: user, roles: []} }}
	)

	// Minimongo does not currently support the $ field selector
	// Remove this guard once it does
	if (!Meteor.isClient) {
		Courses.update(
			{ _id: course._id, 'members.user': user },
			{ '$addToSet': { 'members.$.roles': role }, $set:{'members.$.comment' : comment}},
			checkUpdateOne
		)
	}
}

function removeRole(course, role, user) {
	// Minimongo does not currently support the $ field selector
	// Remove this guard once it does
	if (!Meteor.isClient) {
			var result = Courses.update(
				{ _id: course._id, 'members.user': user },
				{ '$pull': { 'members.$.roles': role }},
				checkUpdateOne
			)
	}

	// Housekeeping: Remove members that have no role left
	// Note that we have a race condition here with the addRole() function, blissfully ignoring the unlikely case
	Courses.update(
		{ _id: course._id },
		{ $pull: { members: { roles: { $size: 0 } }}}
	)
}


Meteor.methods({

	change_subscription: function(courseId, role, add, anon, comment) {
		check(role, String)
		check(courseId, String)
		check(add, Boolean)
		check(anon, Boolean)
		check(comment, Match.OneOf(null, String))
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
				alert('please log in')
				return;
			} else {
				throw new Meteor.Error(401, "please log in")
			}
		}

		if (!course.roles.indexOf(role) == -1) throw new Meteor.Error(404, "No role "+role)

		if (add) {
			addRole(course, role, userId, comment)
			var time = new Date
			Courses.update({_id: courseId}, { $set: {time_lastenrol:time}}, checkUpdateOne)
		} else {
			removeRole(course, role, userId)
		}
	},

	save_course: function(courseId, changes) {
		check(courseId, String)
		check(changes, {
			description: Match.Optional(String),
			categories:  Match.Optional([String]),
			name:        Match.Optional(String),
			region:      Match.Optional(String),
			roles:       Match.Optional(Object)
		})
		var user = Meteor.user()
		if (!user) {
		    if (Meteor.is_client) {
				alert('please log in')
				return;
			} else {
				throw new Meteor.Error(401, "please log in")
			}
		}

		var course;
		var isNew = courseId.length == 0
		if (!isNew) {
			course = Courses.findOne({_id: courseId})
			if (!course) throw new Meteor.Error(404, "Course not found")
		}

 		var mayEdit = isNew || user.isAdmin || Courses.findOne({_id: courseId, members:{$elemMatch: { user: user._id, roles: 'team' }}})
		if (!mayEdit) throw new Meteor.Error(401, "get lost")


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

		if (changes.description) set.description = changes.description.substring(0, 640*1024) /* 640 k ought to be enough for everybody */
		if (changes.categories) set.categories = changes.categories.slice(0, 20)
		if (changes.name) {
		    set.name = changes.name.substring(0, 1000)
		    set.slug = getSlug(set.name);
		}

		set.time_lastedit = new Date
		if (isNew) {
			/* region cannot be changed */
			var region = Regions.findOne({_id: changes.region})
			if (!set.region) throw new Exception(404, 'region missing')
			set.region = region._id

			/* When a course is created, the creator is automatically added as sole member of the team */
			courseId = Courses.insert({
				members: [{ user: user._id, roles: ['team'] }],
				createdby: user._id,
				time_created: new Date
			}, checkInsert)
		}

		Courses.update({ _id: courseId }, { $set: set }, checkUpdateOne)

		return course
	}
})
