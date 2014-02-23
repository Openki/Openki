/*------------------------- new location ------------

Template.location_create.events({
	'click input.add': function () {
		// add new location to db
		if(!Meteor.userId()){
			alert("to create a new location, please log in");
		  	return; // <-- (gruusig... bricht funktion ab) not nice, just ends the function - marcel
		}
		if ($("#addlocation_name").val()==""){
			  // wenn kein kurs name angegeben ist, warne und poste nichts in db
			  alert("Please add at least a name!");
		} else {
			now=new Date();
			// sonst poste in db und cleare die inputfelder;
			Locations.insert({
				name: $("#addlocation_name").val(), 
				description: $("#addlocation_description").val(), 
				hosts:[Meteor.userId()], 
				createdby: Meteor.userId(),  
				time_created: now,
				time_lastedit: now,
				route: "",
				maxPeople: 20,
				maxWorkplaces: 20,

				infra2: {
					'projector': 		'false'
					},
				contact: {
					'web': 		'schniischnaa'
					},
				specials: ""


				 });
			$("#addlocation_name").val("");
			$("#addlocation_description").val("");
		}
	}
});
*/