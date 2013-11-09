// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "description" -> string
// ===========================

LocationCategories = new Meteor.Collection("LocationCategories");

LocationCategories.allow({
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
