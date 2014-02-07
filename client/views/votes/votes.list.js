

Template.votelists.votings=function() {
	var pseudo=Session.get("aktualisierungs_hack");						//FIXME
	var votings=Votings.find({course_id: this._id});
	var course=this
	var subscribers = []
	var roles = course.roles
	if (roles) {											// find all roles and subscribers in it
		for (role in roles) {
			if (roles.hasOwnProperty(role)) {
				subscribers = subscribers.concat(roles[role].subscribed)
			}
		}
	}
	subscribers = _.uniq(subscribers)									// (remove dublicates)


	var votings_array = [];
	for(m = 0; m < votings.count(); m++) {
		voting = votings.db_objects[m];
		subscribers_votings=[];
		voting_total=[];
		for(o = 0; o < voting.options.length; o++) {
			voting_total.push(voting.options[o].votes_0.length);
		}
		for(s = 0; s < subscribers.length; s++) {
			subscriber_options=[];
			for(o = 0; o < voting.options.length; o++) {
				if(voting.options[o].votes_0.indexOf(subscribers[s])!=-1) {
					vote_status="v0";
				}
				else if(voting.options[o].votes_1.indexOf(subscribers[s])!=-1) {
					vote_status="v1";
				}
				else {
					vote_status="";
				}
				subscriber_options.push({option_index:o, vote_status:vote_status,  voting_id:voting._id});
			}
			if(subscribers[s] == Meteor.userId()){
				is_current="is_current";
			}
			else {
				is_current="";
			}
			subscribers_votings.push({is_current:is_current, subscribersId:subscribers[s], is_current: is_current, options:subscriber_options});
			//voting.user_count = voting.users.count()
		}
		voting.total=voting_total;
		voting.subscribers=subscribers_votings;
		votings_array.push(voting);
	}

	return {votings:votings_array};


}


Template.votelists.events({
	'click .is_current .option': function () {
		aktuell=Votings.findOne(this.voting_id);
		if(aktuell.options[this.option_index].votes_0.indexOf(Meteor.userId())!=-1) {

			//zuerst muss angelegt werden, dann gefüllt   Objekt auf linker seite setzen vom : para
			//{}  options ist ein array  Options
			// vielleicht mit stringformating - Java-script kann das einfach nicht

			setModifier = { $pull: {} };
			setModifier.$pull['options.'+this.option_index+'.votes_0'] = Meteor.userId();
			Votings.update(this.voting_id,setModifier);

			setModifier = { $addToSet: {} };
			setModifier.$addToSet['options.'+this.option_index+'.votes_1'] = Meteor.userId();
			Votings.update(this.voting_id,setModifier);
		}
		else if(aktuell.options[this.option_index].votes_1.indexOf(Meteor.userId())!=-1) {
			setModifier = { $pull: {} };
			setModifier.$pull['options.'+this.option_index+'.votes_1'] = Meteor.userId();
			Votings.update(this.voting_id,setModifier);

			setModifier = { $addToSet: {} };
			setModifier.$addToSet['options.'+this.option_index+'.votes_0'] = Meteor.userId();
			Votings.update(this.voting_id,setModifier);
		}
		else {
			setModifier = { $addToSet: {} };
			setModifier.$addToSet['options.'+this.option_index+'.votes_0'] = Meteor.userId();
			Votings.update(this.voting_id,setModifier);
		}
			// FIXME: gruusig, aber sonst aktualisiert es nicht momentan
			// (AktualisierungsHack, damit sich was ändert, könnte man schöner machen-
			// man sieht dann nicht direkt wenn andere person was macht, erst, wenn andere person was macht.
			Session.set("aktualisierungs_hack", Math.random());  // FIXME
	}
 });

/*
Template.votelist.votelist=function(){
	var return_object={};
	return_object.vote_options=["asf","sfsf"];
	return return_object;
}
*/
Template.votelists.addingVote = function () {
		return Session.get('addingVote')
}


Template.votelists.events({
	'click input.show_add_vote': function () {
		Session.set('addingVote', true)
	},
	'click input.create_votelist': function () {
		var option_array=$(".add_vote_option_button").map(function(){return $(this).val();}).get();
		var option_object=[];
		for(var i in option_array) {
			if(option_array[i] !== undefined)
			option_object[i]={option:option_array[i],votes_0:[],votes_1:[],votes_2:[]};
		}
		Votings.insert({type: "text", course_id: this._id, question:$("#add_vote_question").val(), options: option_object});
		Session.set('addingVote', false)
	},
	'click input.add_vote_add_option': function () {
		$("#add_vote_options").append(
		$(".add_vote_option").last().clone()
		);
		$(".add_vote_option > input").last().val("");
	},
	'click input.cancel_votelist': function () {
		Session.set('addingVote', false)
	}
});


