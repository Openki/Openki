
/* ------------------------- Query / List ------------------------- */
get_courselist=function(listparameters){
	//return a course list
	var find ={};
	// modify query --------------------
	if(listparameters.courses_from_userid)
		// show courses that have something to do with userid
		find = _.extend(find, { $or : [ { "organisator" : listparameters.courses_from_userid}, {"subscribers":listparameters.courses_from_userid} ]});
	if(listparameters.missing=="organisator")
		// show courses with no organisator
		find = _.extend(find, {$or : [ { "organisator" : undefined}, {"organisator":""} ]});
	if(listparameters.missing=="subscribers")
		// show courses with not enough subscribers
		find = _.extend(find, {$where: "(this.subscribers && this.subscribers.length < this.subscribers_min) || (!this.subscribers)"} );
	
	var results=Courses.find(find, {sort: {time_created: -1}});
	
	// modify/format result list -----------------
     for(m = 0; m < results.count(); m++){
     	     
     	     course=results.db_objects[m];
	   //  course.createdby=display_username(course.createdby);	 
	    course.time_created=format_date(course.time_created);	
	    
	    // modify subscribers result
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
	    
	    // modify organisator result
	    if(course.organisator){
	    	    course.organisator_status="ok";
	    }else{   
	    	    
	    	    course.organisator_status="notyet";
	    }
	    
	  
  	  
	   
     }
    return results;
  
}


/* ------------------------- List types / Templates ------------------------- */

  Template.courselist.courses = function () {
  // needed to actualize courses
   return this.courses;
  };
  
  // Template handlers ---------------

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


/* ------------------------- User Helpers ------------------------- */


  Template.course.is_subscribed = function () {
  	  // is current user subscriber
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
  	  // is current user organisator
   	   if(Meteor.userId()){
 	  if (this.organisator==Meteor.userId()){
 	  	  	return  true;
 	  	}else{
 	  		return false; 
 	  	}
 	  }
   };


/* -------------------------  Events-------------------------*/
  Template.course.events({
    'click': function () {
    	   
      Router.setCourse( this._id, this.name);

    }
  });
