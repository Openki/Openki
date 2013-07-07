// ======== DB-Model: ========
// "_id" -> ID
// "title" -> string
// "text" -> string
// "user_ID" -> ID_users
// "course_ID" -> ID_Courses
// "time_created" -> timestamp
// "time_updated" -> timestamp
// "parent_ID" -> ID_CourseDiscussions
// ===========================

CourseDiscussions = new Meteor.Collection("CourseDiscussions");

// Meteor.publish("CourseDiscussions", function(){
//      return CourseDiscussions.find({});
//   });

CourseDiscussions.allow({
   update: function (userId, doc, fieldNames, modifier) {
    return userId && true;   // allow only if UserId is present
   },
   insert: function (userId, doc) {
    return userId && true;   // allow only if UserId is present
    },
   remove: function (userId, doc) {
    return 
    userId && true;   // allow only if UserId is present
    }
});