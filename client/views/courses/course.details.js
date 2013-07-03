
/* ------------------------- Details ------------------------- */

  Template.coursedetails.isEditing = function () {
    return Session.get("isEditing");
  };

 Template.coursedetails.isSubscribed = function () {
 	 var my_sub = CourseSubscriptions.findOne({user_id: Meteor.userId(), course_id: Session.get("selected_course")});
 	  if (my_sub){
 	  
 	  	  
 	 return  true;
 	  }else{
 	  	return false; 
 	  }
  };

  Template.coursedetails.events({
    'click input.inc': function () {
      // bei click auf das input-element mit der class "inc",
      // erh�he den score dieses Kurses um eins
      Courses.update(Session.get("selected_course"), {$inc: {score: 1}});
    },
    
    'click input.subscribe': function () {
    	// für Kurs anmelden
     	     CourseSubscriptions.insert({user_id: Meteor.userId(), course_id: Session.get("selected_course")});
    	 
    },
    
    'click input.unsubscribe': function () {
    	// von Kurs abmelden
    	// ist so komisch verschachtelt weil nur über userid gelöscht werden darf

    	    CourseSubscriptions.remove({_id: CourseSubscriptions.findOne({user_id: Meteor.userId(), course_id: Session.get("selected_course")})._id});
    	 
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
      Courses.update(Session.get("selected_course"), {$set: {description: $('#editform_description').val(), tags: $('#editform_tags').val()}});
      Session.set("isEditing", false);
    }
  });
  
  Template.coursedetails.subscribers = function() {
  	
  	 return CourseSubscriptions.find({course_id: Session.get("selected_course")}, {sort: {score: -1, name: 1}});
  }

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
    return course && {name: course.name, desc: course.description, tags: course.tags, score: course.score,  createdby: createdby, time_created: time_created};
 
  }};
  
  
