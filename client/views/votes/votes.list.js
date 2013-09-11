

Template.votelists.votings=function(){
var pseudo=Session.get("aktualisierungs_hack");
	votings=Votings.find({course_id: Session.get("selected_course")});

	course=Courses.findOne(Session.get("selected_course"));
	if(course){
        if(course.roles.participant.subscribed){               //doesn't work! -> crashes if non, how to?
            subscribers=course.roles.participant.subscribed;
        }
        else{
            subscribers=course.roles.team.subscribed;           // for testing purpose
        }


	var votings_array = [];
	for(m = 0; m < votings.count(); m++){

	    voting = votings.db_objects[m];
     	subscribers_votings=[];
     	voting_total=[];
     	for(o = 0; o < voting.options.length; o++){
     	    voting_total.push(voting.options[o].votes_0.length);
     	}

     	for(s = 0; s < subscribers.length; s++){
     	    subscriber_options=[];

     	for(o = 0; o < voting.options.length; o++){
     	    if(voting.options[o].votes_0.indexOf(subscribers[s])!=-1){
     	     vote_status="v0";
     	    }else if(voting.options[o].votes_1.indexOf(subscribers[s])!=-1){
     	     vote_status="v1";
     	    }else{
     	    vote_status="";
     	    }
     	    subscriber_options.push({option_index:o, vote_status:vote_status,  voting_id:voting._id});
     	}

     //	alert(subscribers[s]+" --- "+Meteor.userId());
     //	alert(typeof subscribers[s]+" --- "+ typeof Meteor.userId());

     if(subscribers[s] == Meteor.userId()){
     	 is_current="is_current";
     }else{
         is_current="";
     }

     	    subscribers_votings.push({is_current:is_current, subscribersId:subscribers[s], is_current: is_current, options:subscriber_options});
     	     //voting.user_count = voting.users.count()
     	}

     	voting.total=voting_total;
     	voting.subscribers=subscribers_votings;
     	votings_array.push(voting);
	}

//return {votings:votings_array, subscribers:subscribers_votings};
return {votings:votings_array};
	}

}


 Template.votelists.events({
    'click .is_current .option': function () {
      // bei click auf das input-element mit der class "inc",
      // erh�he den score dieses Kurses um
	     aktuell=Votings.findOne(this.voting_id);
	     if(aktuell.options[this.option_index].votes_0.indexOf(Meteor.userId())!=-1){

	         //zuerst muss angelegt werden, dann gefüllt   Objekt auf linker seite setzen vom : para
	         //{}  options ist ein array  Options
	         // vielleicht mit stringformating - Java-script kann das einfach nicht

	         	setModifier = { $pull: {} };
	        setModifier.$pull['options.'+this.option_index+'.votes_0'] = Meteor.userId();
	       Votings.update(this.voting_id,setModifier);

	             setModifier = { $addToSet: {} };
	        setModifier.$addToSet['options.'+this.option_index+'.votes_1'] = Meteor.userId();
	        Votings.update(this.voting_id,setModifier);



	     }else if(aktuell.options[this.option_index].votes_1.indexOf(Meteor.userId())!=-1){
	         	setModifier = { $pull: {} };
	        setModifier.$pull['options.'+this.option_index+'.votes_1'] = Meteor.userId();
	       Votings.update(this.voting_id,setModifier);

	             setModifier = { $addToSet: {} };
	        setModifier.$addToSet['options.'+this.option_index+'.votes_0'] = Meteor.userId();
	        Votings.update(this.voting_id,setModifier);
	     }else{

	             setModifier = { $addToSet: {} };
	        setModifier.$addToSet['options.'+this.option_index+'.votes_0'] = Meteor.userId();
	        Votings.update(this.voting_id,setModifier);

	     }
	        // gruusig, aber sonst aktualisiert es nicht momentan
	        // (AktualisierungsHack, damit sich was ändert, könnte man schöner machen-
	        // man sieht dann nicht direkt wenn andere person was macht, erst, wenn andere person was macht.
	        Session.set("aktualisierungs_hack", Math.random());
	}
 });



/*
Template.votelist.votelist=function(){

var return_object={};
return_object.vote_options=["asf","sfsf"];

	return return_object;


}
*/
 Template.votelists.events({
    'click input.show_add_vote': function () {
    	   $("#add_vote_form").show();
    },
    'click input.create_votelist': function () {
    	 var option_array=$(".add_vote_option_button").map(function(){return $(this).val();}).get();

    	 var option_object=[];

	 for(var i in option_array) {
	  if(option_array[i] !== undefined)
	      option_object[i]={option:option_array[i],votes_0:[],votes_1:[],votes_2:[]};
	     }
    	 Votings.insert({type: "text", course_id: Session.get("selected_course"), question:$("#add_vote_question").val(), options: option_object});
    	 $('#add_vote_form')[0].reset();
    	 $('#add_vote_form').hide();
    },
    'click input.add_vote_add_option': function () {
    	$("#add_vote_options").append(
    	    $(".add_vote_option").last().clone()
    	);

    	   $(".add_vote_option > input").last().val("");
    }
  });


