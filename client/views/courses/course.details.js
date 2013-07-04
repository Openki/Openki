
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
 // if(Meteor.userId())
    Session.set("isEditing", true);
  //else
    //alert("Security robot say: sign in");
    },
    'click input.save': function () {
      // wenn im edit-mode abgespeichert wird, update db und verlasse den edit-mode
      Courses.update(Session.get("selected_course"), {$set: {description: $('#editform_description').val(), tags: $('#editform_tags').val(), categories: $('#editform_category').val(), name: $('#editform_name').val()}});
      Session.set("isEditing", false);
    },
    'click input.cancel': function() {
      Session.set("isEditing", false);
    }
  });
  
  Template.coursedetails.subscribers = function() {
  	  //Anmeldungen auslesen
  	 return Courses.findOne(Session.get("selected_course")).subscribers;
 }

     Template.coursedetails.isSubscribed = function () {
     	//ist User im subscribers-Array?
     	 if(Courses.findOne(Session.get("selected_course")).subscribers){
     	    if(Courses.findOne(Session.get("selected_course")).subscribers.indexOf(Meteor.userId())!=-1){
 	  	  return  true;
 	    }else{
 	  	return false; 
 	    }
 	  }
     };


   Template.coursedetails.organisator = function() {
  	 return Courses.findOne(Session.get("selected_course")).organisator;
  }
  
   Template.coursedetails.isOrganisator = function () {
 	  if (Courses.findOne(Session.get("selected_course")).organisator==Meteor.userId()){
 	  	  return  true;
 	  }else{
 	  	return false; 
 	  }
  };
  

  Template.coursedetails.selected_name = function () {
    // gib den name und die description des ausgew�hlten kurses zur�ck
    // wird aufgerufen, sobald "selected_course" ändert (z.B. routing)
    var course = Courses.findOne(Session.get("selected_course"));
    if(course){
    	    
    	    //Strub: es lädt die daten nicht neu, wenn man von der liste her kommt???
 //var createdby=display_username(course.createdby);
 var createdby=course.createdby;
// var time_created= format_date(course.time_created);
 var time_created= course.time_created;
    return course && {name: course.name, desc: course.description, tags: course.tags, category: course.category, score: course.score,  createdby: createdby, time_created: time_created};
  }};
  
  
