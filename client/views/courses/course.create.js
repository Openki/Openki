// Timestamp, das muss man eigentlich auf der Serverseite machen,
// damit mans nicht faken kann?? Noch anschauen.
// an einen besseren ort knallen


/*------------------------- Form_ Neuer Kurs erstellen ------------*/

  Template.form.events({
    'click input.add': function () {

      // add new course to db

      var form = document.forms[0]; // get first form-element
      var name = form.elements["addform_name"].value;

	if(!Meteor.userId()){
		alert("to create a new course, please log in");
      		return; // <-- (gruusig... bricht funktion ab) not nice, just ends the function - marcel
    	}
      if (!name){
          // wenn kein kurs name angegeben ist, warne und poste nichts in db
          alert("Please add at least a name!");      }else{
      	
          // sonst poste in db und cleare die inputfelder
          var description = form.elements["addform_description"].value;
          Courses.insert({name: name, description: description, score: 0, time_created: get_timestamp(), time_changed: get_timestamp(), createdby:Meteor.userId(), subscribers_min:1, subscribers_max:12});
          form.elements["addform_name"].value = "";
          form.elements["addform_description"].value = "";
      }
    }

  });


