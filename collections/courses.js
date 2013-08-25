// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "createdby" -> ID_users
// "time_created" -> timestamp
// "time_changed" -> timestamp
// "categories" -> ID_categories
// "description" -> string
// "score" -> int
// "subscribers_min" -> int
// "subscribers_max" -> int
// "subscribers" -> [ID_users]
// ===========================

Courses = new Meteor.Collection("Courses");

Courses.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && true;   // allow only if UserId is present
	},
	insert: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
	remove: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	}
});
