"use strict";

/* ------------------------- Details ------------------------- */

  Template.coursedetails.isEditing = function () {
    return Session.get("isEditing");
  };


Template.coursedetails.events({

	'click input.del': function () {
		if (confirm("wirklich?")) {
			Courses.remove(Session.get("selected_course"));
			Router.navigate('/', true);
		}
	},

    'click input.edit': function () {
      // gehe in den edit-mode, siehe html
      if(Meteor.userId())
      	      Session.set("isEditing", true);
      else
      	      alert("Security robot say: sign in");
    },

    'click input.subscribe': function () {
		var course = Session.get("selected_course")
		Meteor.call("change_subscription", course, this.roletype.type, true)
    },

    'click input.unsubscribe': function () {
		var course = Session.get("selected_course")
		Meteor.call("change_subscription", course, this.roletype.type, false)
    }
})


// nur für css

  Template.coursedetails.subscribers_status = function() {
  	  //CSS status: genug anmeldungen? "ok" "notyet"
  	var course=Courses.findOne(Session.get("selected_course"));
  	if(course){
  	  if(course.subscribers){
  	  	  if(course.subscribers.length>=course.subscribers_min){
			  return "ok";
		  }else{
			  return "notyet";
		  }
  	  }
  	}
  }

Template.coursedetails.roleDetails = function(roles) {
	return _.reduce(Roles.find().fetch(), function(goodroles, roletype){
		var role = roles[roletype.type]
		if (role) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: role.subscribed.indexOf(Meteor.userId()) >= 0
			})
		}
		return goodroles
	}, [])
}

// muss zuert aufruf abfragen , obs couses existiertfunktionniert hat  indexOf
// zuerst genereller aufruf machen weil courses muss ready sein
// dann könte man direkt machen
// wenn man fetch macht würds funktionnieren  -- oder auch nicht.
// find one gibt nicht Course sondern Curser zurück (asynchron data loader xyz)
// gibt nichts zurück, weis asynchon ist

	Template.coursedetails.isSubscribed = function () {
		//ist User im subscribers-Array?
		var course = Courses.findOne(Session.get("selected_course"));
		return course && course.subscribers.indexOf(Meteor.userId()) > -1
	}


   Template.coursedetails.organisator = function() {
       course=Courses.findOne(Session.get("selected_course"));
       if(course)
           return course.organisator;


   }


   Template.coursedetails.isOrganisator = function () {
       course=Courses.findOne(Session.get("selected_course"));
       if(course){
          if (course.organisator==Meteor.userId()){
              return  true;
            }else{
                return false;
            }
        }
  };


Template.coursedetails.role_description = function(role) {
	console.log(role)
	return Roles.findOne({type: role}).description
}



