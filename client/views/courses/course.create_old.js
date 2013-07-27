/*------------------------- Form_ Neuer Kurs erstellen ------------*/
 	
  Template.course_create.events({
    'click input.add': function () {

      // add new course to db


	if(!Meteor.userId()){
		alert("to create a new course, please log in");
      		return; // <-- (gruusig... bricht funktion ab) not nice, just ends the function - marcel
    	}
      if ($("#addform_name").val()==""){
          // wenn kein kurs name angegeben ist, warne und poste nichts in db
          alert("Please add at least a name!");      }else{
     
          // sonst poste in db und cleare die inputfelder
          Courses.insert({name: $("#addform_name").val(), description: $("#addform_description").val(), score: 0, time_created: get_timestamp(), time_changed: get_timestamp(), createdby:Meteor.userId(), subscribers_min:1, subscribers_max:12, subscribers:[], categories: $("#addform_category").val()});
          $("#addform_name").val(""); 
          $("#addform_description").val("");
      }
    }
  });


