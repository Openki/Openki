// ======== DB-Model: ========
// "_id" -> ID
// "question" -> string
// "type" -> string
// "course_id" -> ID_Courses
// "options" -> ["option" -> string,
//               "votes" -> int]
// ===========================

Votings = new Meteor.Collection("Votings");

Votings.allow({
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

Meteor.publish ('votings', function(){
	return Votings.find();
});
