// ======== DB-Model: ========
// TODO: update!!
// "_id" -> ID
// "name" -> string
// "slug" -> string
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


function findCourses(params){
	var find = {};

	if (params.member) {
		// courses where given user is member
		find.members = { user: params.member }
	}

	if (Session.get('region')) {
		find.region = Session.get('region')
	}

	if (params.missing=="organisator") {
		// show courses with no organisator
		find['members.roles'] = { $ne: 'team' }
	}
	
	if (param.search) {
		_.extend(find, {
			$or: [
				// FIXME: Runs unescaped as regex, absolutely not ok
				// ALSO: Not user friendly, do we can have fulltext?
				{ name: { $regex: param.search, $options: 'i' } },
				{ description: { $regex: param.search, $options: 'i' } }
			]
		})
	}

	return Courses.find(find, {sort: {time_lastedit: -1, time_created: -1}});
}

function addRole(course, role, user) {
	// Add the user as member if she's not listed yet
	Courses.update(
		{ _id: course._id, 'members.user': { $ne: user } }, 
		{ $addToSet: { 'members': { user: user, roles: [] } }}
	)
	
	// Minimongo does not currently support the $ field selector
	// Remove this guard once it does
	if (!Meteor.isClient) {
		Courses.update(
			{ _id: course._id, 'members.user': user }, 
			{ '$addToSet': { 'members.$.roles': role }}, 
			checkUpdateOne
		)
	}
}

function removeRole(course, role, user) {
	// Minimongo does not currently support the $ field selector
	// Remove this guard once it does
	if (!Meteor.isClient) {
			Courses.update(
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
		if (!course.roles.indexOf(role) == -1) throw new Meteor.Error(404, "No role "+role)

		if (add) {
			addRole(course, role, userId)
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


		_.each(Roles.find().fetch(), function(roletype) {
			var type = roletype.type
			var should_have = roletype.preset || changes.roles && changes.roles[type]
			var have = course.roles.indexOf(type) !== -1
			if (have && !should_have) {
				Courses.update(
					{ _id: courseId },
					{ $pull: { roles: type, 'members.roles': type }}, 
					checkUpdateOne
				)
			}
			if (!have && should_have) {
				Courses.update(
					{ _id: courseId },
					{ $addToSet: { roles: type }},
					checkUpdateOne
				)
			}
		})

		/* Changes we want to perform */
		var set = {}

		if (changes.description) set.description = changes.description.substring(0, 640*1024) /* 640 k ought to be enough for everybody */
		if (changes.categories) set.categories = changes.categories.slice(0, 20)
		if (changes.name) {
		    set.name = changes.name.substring(0, 1000)
		    set.slug = convertToSlug(set.name);
		}

		set.time_lastedit = new Date
		if (isNew) {
			/* region cannot be changed */
			set.region = Regions.findOne({_id: changes.region})
			if (!set.region) throw new Exception(404, 'region missing')
			
			courseId = Courses.insert({
				members: [{ user: user._id, roles: [] }],
				createdby: user._id,
				time_created: new Date
			}, checkInsert)
		}
		
		Courses.update({ _id: courseId }, { $set: set }, checkUpdateOne)
		return courseId
	}
})


function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

/* Need to find a good place to make these available to all */

function checkInsert(err, id) {
	if (err) throw err
}

function checkUpdateOne(err, aff) {
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1"
}
