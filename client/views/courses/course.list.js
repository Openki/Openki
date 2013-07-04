get_courselist=function(listparameters){
	//alert(listparameters.toSource());
	var find ={};
	
	if(listparameters.courses_from_userid)
		find = _.extend(find, { $or : [ { "organisator" : listparameters.courses_from_userid}, {"subscribers":listparameters.courses_from_userid} ]});
	if(listparameters.missing=="organisator")
		find = _.extend(find, {$or : [ { "organisator" : undefined}, {"organisator":""} ]});
	if(listparameters.missing=="subscribers")
		// weniger subscribers.length als subscribers_min
		find = _.extend(find, {$where: "(this.subscribers && this.subscribers.length < this.subscribers_min) || (!this.subscribers)"} );
	
	//if(listparameters.limit)
		//var limit = {limit: 3};
		//var options = [];
		//options
	
	var results=Courses.find(find, {sort: {time_created: -1, name: 1}});
	
     for(m = 0; m < results.count(); m++){
     	     course=results.db_objects[m];
	   //  course.createdby=display_username(course.createdby);	 
	    course.time_created=format_date(course.time_created);	    
	
	    if(course.subscribers){
		    course.subscriber_count=  course.subscribers.length;	    
		 if(course.subscriber_count>=course.subscribers_min){
		 	 course.subscribers_status="ok";
		 }else{
		 	 course.subscribers_status="notyet";
		 }
		
	    }else{
	    	    course.subscriber_count=0;
	    	    course.subscribers_status="notyet";
	    }
	    if(course.organisator){
		    
	    	    course.organisator_status="ok";
	    }else{   
	    	    
	    	    course.organisator_status="notyet";
	    }
	    
	  
  	  
	   
     }
    return results;
  
}


/* ------------------------- Course-list ------------------------- */

  Template.courselist.courses = function () {
  // macht, dass es die courses tatsächlich aktualisiert
   return this.courses;
  };

  
  Template.coursepage.all_courses = function () {
  	  var return_object={};
  	  return_object.courses= get_courselist({});
  	  return return_object;
  };

  
  
  
  Template.home.missing_organisator = function() {
  	  var return_object={};
  	  return_object.courses= get_courselist({missing: "organisator"});
  	  return return_object;
  }
  
 Template.home.missing_subscribers = function() {
  	  var return_object={};
  	  return_object.courses= get_courselist({missing: "subscribers"});
  	  return return_object;
  }
  
   Template.profile.courses_from_userid = function() {
  	  var return_object={};
  	  return_object.courses= get_courselist({courses_from_userid: Meteor.userId()});
  	  return return_object;
  }




/* ------------------------- Course ------------------------- */


  
   
  Template.course.is_subscribed = function () {
   	   if(Meteor.userId()){
        	 if(this.subscribers){
     	    if(this.subscribers.indexOf(Meteor.userId())!=-1){
 	  	  return  true;
 	    }else{
 	  	return false; 
 	    }
 	  }   
   }
   };

   Template.course.is_organisator = function () {
   	   if(Meteor.userId()){
 	  if (this.organisator==Meteor.userId()){
 	  	  return  true;
 	  }else{
 	  	return false; 
 	  }
 	   }
   };




/* ------------------------- Course anwählen-------------------------*/
  Template.course.events({
    'click': function () {
      // speichere in sesssetion, welcher kurs angeklickt wurde
      // um ihn per class "selected" im css gelb zu hinterlegen

      Router.setCourse( this._id, this.name);

    }
  });


