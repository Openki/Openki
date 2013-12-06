// ======== DB-Model: ========
// "_id" -> ID
// "title" -> string
// blablabla
// ===========================

Events = new Meteor.Collection("Events");


Events.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && true;	// allow only if UserId is present
	},
	insert: function (userId, doc) {
		return userId && true;	// allow only if UserId is present
	},
	remove: function (userId, doc) {
		return userId && true;	// allow only if UserId is present
	}
});
