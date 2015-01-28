// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// ("Parent" -> ID?)
// "descripton" -> string
// "createdby" ->  FIXME
// "time_created" ->
// "time_lastedit" ->
// ===========================


Groups = new Meteor.Collection("Groups");

Groups.allow({
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
