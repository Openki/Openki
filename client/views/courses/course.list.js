get_courselist=function(listparameters){
	var find ={};
	
	if(listparameters.courses_from_userid)
		find = _.extend(find, { $or : [ { "organisator" : listparameters.courses_from_userid}, {"subscribers":listparameters.courses_from_userid} ]});
	
	//if(listparameters.limit)
		//var limit = {limit: 3};
		//var options = [];
		//options
	
	var results=Courses.find(find, {sort: {time_created: -1, name: 1}});
	
     for(m = 0; m < results.count(); m++){
	   //  results.db_objects[m].createdby=display_username(results.db_objects[m].createdby);	 
	    results.db_objects[m].time_created=format_date(results.db_objects[m].time_created);	    
	
	    if(results.db_objects[m].subscribers){
		    results.db_objects[m].subscriber_count=  results.db_objects[m].subscribers.length;	    
	    }
	    if(results.db_objects[m].organisator){
		    results.db_objects[m].has_organisator=1;	    
	    }else{
		    results.db_objects[m].has_organisator=0;	   
	    }
	   
     }
    return results;
  
}


/* ------------------------- Course-list ------------------------- */

  Template.courselist.courses = function () {

    // gib alle kurse zur�ck, zuerst umgekehrt nach score sortiert und
    // dann nach name sortiert.
   return get_courselist({});
  };

  


/* ------------------------- Course ------------------------- */

  Template.course.selected = function () {
    // bin ich der "selected_course", dann gib mir im html die class "selected"
    return Session.equals("selected_course", this._id) ? "selected" : '';
  };

  Template.course.hoveredString = function () {
    // bin ich der "hovered_course", dann gib mir im html die class "hovered"
    return Session.equals("hovered_course", this._id) ? "hovered" : '';
  };
  
   
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
 	  if (this.organisator==Meteor.userId()){
 	  	  return  true;
 	  }else{
 	  	return false; 
 	  }
   };




/* ------------------------- Course anwählen-------------------------*/
  Template.course.events({
    'click': function () {
      // speichere in sesssetion, welcher kurs angeklickt wurde
      // um ihn per class "selected" im css gelb zu hinterlegen

      Router.setCourse( this._id, this.name);

    },
    'mouseenter': function () {
      // speichere in session, �ber welchem kurs der maus-cursor war
      // um ihn per class "hovered" im css fett zu machen
      Session.set("hovered_course", this._id);
    }
  });



