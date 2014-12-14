// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "timeZone" -> string
// ===========================Regions = new Meteor.Collection("Regions");

Regions = new Meteor.Collection("Regions");


Regions.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && false;
	},
	insert: function (userId, doc) {
		return userId && false;
	},
	remove: function (userId, doc) {
		return userId && false;
	}
});
