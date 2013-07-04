

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
    },

    
//    set:  function (userId, doc, a, b) {
//    return userId && true;   // allow only if UserId is present
//    }

});

/*
Session = new Meteor.Collection("Session");

Session.allow({
		set: function (a, b) {
			return userId && true;   // allow only if UserId is present
		}
		
});		


*/
