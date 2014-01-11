// ======== DB-Model: ========3
// "_id" -> ID
// "name" -> string
// "createdby" -> ID_users
// "time_created" -> timestamp
// "time_lastedit" -> timestamp
// "categories" -> ID_categories
// "description" -> string
// "subscribers" -> [ID_users]
// ===========================

Courses = new Meteor.Collection("Courses");

Courses.allow({
	remove: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	}
});


Meteor.methods({
	change_subscription: function(courseId, role, add) {
		check(role, String)
		check(courseId, String)
		check(add, Boolean)
		var userId = Meteor.userId()
		var course = Courses.findOne({_id: courseId})
		if (!course) throw new Meteor.Error(404, "Course not found")
		if (!userId) {
			// Oops
			if (Meteor.is_client) {
				alert('please log in')
				return;
			} else {
				throw new Meteor.Error(401, "please log in")
			}
		}
		if (!course.roles[role]) throw new Meteor.Error(404, "No role "+role)

		var update = {}
		update[add ? '$addToSet' : '$pull'] = { 'participants.$.roles': role }
		Courses.update({_id: course._id, 'participants.user': userId }, update)
		var time = new Date
		Courses.update(course, { $set: {time_lastenrol:time}})
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
			throw new Meteor.Error(401, "please log in")
		}

		var course;
		var isNew = courseId.length == 0
		if (isNew) {
			course = { roles: {  } }
		} else {
			course = Courses.findOne({_id: courseId})
			if (!course) throw new Meteor.Error(404, "Course not found")
		}

 		var mayEdit = isNew || user.isAdmin || Courses.findOne({_id: courseId, roles:{$elemMatch: { user: user._id, roles: 'team' }}})
		if (!mayEdit) throw new Meteor.Error(401, "get lost")

		/* Changes we want to perform */
		var update = {
			$set: {},
			$unset: {},
			$addToSet: { roles: [] },
			$pull: { roles: [], participants: { roles: [] } }
		}

		_.each(Roles.find().fetch(), function(roletype) {
			var type = roletype.type
			var should_have = roletype.preset || changes.roles && changes.roles[type]
			var have = course.roles.indexOf(type) !== -1
			if (have && !should_have) {
				update.$pull.roles.push(type)
				update.$pull.participants.roles.push(type)
			}
			if (!have && should_have) update.$addToSet.roles.push(type)
		})

		if (changes.description) update.$set.description = changes.description.substring(0, 640*1024) /* 640 k ought to be enough for everybody */
		if (changes.categories) update.$set.categories = changes.categories.slice(0, 20)
		if (changes.name) update.$set.name = changes.name.substring(0, 1000)

		update.$set.time_lastedit = new Date
		if (isNew) {
			/* region cannot be changed */
			update.$set.region = Regions.findOne({_id: changes.region})
			if (!update.$set.region) throw new Exception(404, 'region missing')
			
			courseId = Courses.insert({
				participants: [{ user: user._id, roles: [] }],
				createdby: user._id,
				time_created: new Date
			}, checkInsert)
		}
		Courses.update({ _id: courseId }, update, checkUpdateOne)
		return courseId
	}
})


/* Need to find a good place to make these available to all */

function checkInsert(err, id) {
	if (err) throw err
}

function checkUpdateOne(err, aff) {
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1"
}
