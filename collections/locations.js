// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "region" -> ID_region
// "categories" -> string
// "maxPeople" -> int
// "maxWorkplaces" -> int
// "adress" -> string
// "route" -> string
// "description" -> string
// "contact" -> {"meetings","email","web","fon"... -> strings}
// "picture" -> string   (lokal/external link)
// "infra" -> not clear jet
// "createdby" -> ID_user
// "hosts" -> [ID_users]
// "contacts" -> [ID_users]
// ===========================



Locations = new Meteor.Collection("Locations");

Locations.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && true;   // allow only if UserId is present
	},
	insert: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
	remove: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
});
