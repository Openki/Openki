
/* ------------------------- Details ------------------------- */

  Template.coursedetails.isEditing = function () {
    return Session.get("isEditing");
  };


Template.coursedetails.events({
    'click input.inc': function () {
      // bei click auf das input-element mit der class "inc",
      // erh�he den score dieses Kurses um eins
      Courses.update(Session.get("selected_course"), {$inc: {score: 1}});
    },

    'click input.get_subscriber': function () {
    	// für Kurs anmelden (array: subscribers)
     	  Courses.update(Session.get("selected_course"), {$addToSet:{subscribers: Meteor.userId()}});

    },

    'click input.remove_subscriber': function () {
    	// von Kurs abmelden
    	Courses.update(Session.get("selected_course"), {$pull:{subscribers: Meteor.userId()}});
       },

    'click input.get_organisator': function () {
    	// Orga werden
    	Courses.update(Session.get("selected_course"), {$set:{organisator: Meteor.userId()}});
    },


    'click input.remove_organisator': function () {
    	// Orga künden
      	Courses.update(Session.get("selected_course"), {$set:{organisator: ""}});
      },


	'click input.del': function () {
		if (confirm("wirklich?")) Courses.remove(Session.get("selected_course"));

		Router.navigate('/', true);
	},

    'click input.edit': function () {
      // gehe in den edit-mode, siehe html
      if(Meteor.userId())
      	      Session.set("isEditing", true);
      else
      	      alert("Security robot say: sign in");
    }
});



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



