
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
      // bei click auf das input-element mit der class "del"
      // l�sche den ausgew�hlten kurs
      Courses.remove(Session.get("selected_course"));
      // select new cours:
      Session.set("selected_course", Courses.find().fetch()[0]._id); //select first of db
      // erstelle neue, wenns keine mehr gibt:
      createCoursesIfNone();
     },
    'click input.edit': function () {
      // gehe in den edit-mode, siehe html
      if(Meteor.userId())
      	      Session.set("isEditing", true);
      else
      	      alert("Security robot say: sign in");
    },
    'click input.save': function () {
      // wenn im edit-mode abgespeichert wird, update db und verlasse den edit-mode
      Courses.update(Session.get("selected_course"), {$set: {description: $('#editform_description').val(), tags: $('#editform_tags').val(), categories: $('#editform_category').val(), name: $('#editform_name').val(), subscribers_min: $('#editform_subscr_min').val(), subscribers_max: $('#editform_subscr_max').val()}});
      Session.set("isEditing", false);
    },
    'click input.cancel': function() {
      Session.set("isEditing", false);
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
           //return display_username(course.organisator);
           
  
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



