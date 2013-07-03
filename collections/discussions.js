CourseDiscussions = new Meteor.Collection("CourseDiscussions");

Meteor.publish("CourseDiscussions", function(){
    return CourseDiscussions.find({});
  });

CourseDiscussions.allow({
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