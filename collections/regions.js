// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "timeZone" -> string
// ===========================Regions = new Meteor.Collection("Regions");

Regions = new Meteor.Collection("Regions");
Regions._ensureIndex({loc : "2dsphere"});


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
