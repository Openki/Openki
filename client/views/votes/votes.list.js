

Template.votelists.votings=function(){
	
	votings=Votings.find({course_id: Session.get("selected_course")});
	
	course=Courses.findOne(Session.get("selected_course"));
	if(course){
	    subscribers=course.subscribers;
	    
	    
	var votings_array = [];
	for(m = 0; m < votings.count(); m++){  	     
	    
	    voting = votings.db_objects[m];  
     	subscribers_votings=[];
     	
     	for(s = 0; s < subscribers.length; s++){ 
     	    subscriber_options=[];
     	    
     	for(o = 0; o < voting.options.length; o++){ 
     	    subscriber_options.push("x");
     	    
     	}
     //	alert(subscribers[s]+" --- "+Meteor.userId());
       
     	//if(subscribers[s] == Meteor.userId()){
     	 is_current="is_current";   
     	//}
     	 
     	    subscribers_votings.push({name:subscribers[s], is_current: is_current, options:subscriber_options});
     	     //voting.user_count = voting.users.count()
     	}
     	votings_array.push(voting);

	}

//	return {votings:votings_array, subscribers:subscribers_votings};
	}
	
}


 Template.votelists.events({
    'click .is_current .option': function () {
      // bei click auf das input-element mit der class "inc",
      // erh�he den score dieses Kurses um 
      
	        alert("Handler for .click() called."+$(this));
	}
 });




Template.votelist.votelist=function(){
	/*
var return_object={};
return_object.vote_options=["asf","sfsf"];

	return return_object;
*/
	
}

 Template.votelists.events({
    'click input.show_add_vote': function () {
    	   $("#add_vote_form").show();
    },
    'click input.create_votelist': function () {
    	 var option_array=$(".add_vote_option_button").map(function(){return $(this).val();}).get();
    	 
    	 var option_object=[];

	 for(var i in option_array) {
	  if(option_array[i] !== undefined) 
	      option_object[i]={option:option_array[i],user_votes:""};
	     }
    	 Votings.insert({type: "text", course_id: Session.get("selected_course"), question:$("#add_vote_question").val(), options: option_object});
    	 $('#add_vote_form')[0].reset();
    	 $('#add_vote_form').hide();
    },
    'click input.add_vote_add_option': function () {
    	$("#add_vote_options").append(
    	    $(".add_vote_option").last().clone()
    	);
    }
  });
 
 
