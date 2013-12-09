


Template.course_event_edit.events({
	'click input.saveEditEvent': function () {
		if(Meteor.userId()){

			var dateParts =  $('#edit_event_startdate').val().split(".");
			if($('#edit_event_starttime').val()!=""){
				var timeParts =  $('#edit_event_starttime').val().split(":");
			}else{
				var timeParts =  [0,0];
			}
			var startdate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0],timeParts[0],timeParts[1]);

			var editevent = {
				title: $('#edit_event_title').val(),
				description: $('#edit_event_description').val(),
				mentors: $('input:checkbox:checked.edit_event_mentors').map(function(){ return this.name}).get(),
				startdate: startdate,
				starttime: $('#edit_event_starttime').val(),
				enddate: $('#edit_event_enddate').val(),
				endtime: $('#edit_event_endtime').val(),
			}

			if (this.event._id) {		
	
				console.log("1")
				Events.update(this.event._id, { $set: editevent })		
				console.log("2")
			} else {

				editevent.course_id= this.course._id
				editevent.createdby = Meteor.userId()
				Events.insert(editevent)
			}

			Session.set("isEditingEvent", false);
			Session.set("isAddingEvent", false);
		}else{
			alert("Security robot say: please sign in!");
		}
	},

	'click input.cancelEditEvent': function() {
		Session.set("isEditingEvent", false);
	}
});

Template.course_event_edit.possible_mentors = function() {
	
	var possible_mentors=[];
	//var course = this.course
		if(this.course.roles.mentor){
			
			var eventobj=this.event;
				_.each(this.course.roles.mentor.subscribed, function (userid) {
				var user = Meteor.users.findOne({_id: userid})
				if (!user) return;
				if(eventobj._id){

					if(eventobj.mentors.indexOf(user._id)==-1){
						var checked ="";
					}else{
						var checked ="checked";
					};
				}
			//	alert($.inArray(user._id,eventobj.mentors));
				//alert();
				//alert(user._id)
				//alert(eventobj.mentors)
				//possible_mentors.push(user);
				possible_mentors.push({"username": user.username, "id":user._id, "checked":checked})
			});
				

	}
	
	return possible_mentors;
}


Template.course_event_edit.possible_hosts = function() {
	
	var possible_hosts=[];
	//var course = this.course
		if(this.course.roles.mentor){
			
			var eventobj=this.event;
				_.each(this.course.roles.host.subscribed, function (userid) {
				var user = Meteor.users.findOne({_id: userid})
				if (!user) return;
				if(eventobj._id){

					if(eventobj.mentors.indexOf(user._id)==-1){
						var checked ="";
					}else{
						var checked ="checked";
					};
				}
			//	alert($.inArray(user._id,eventobj.mentors));
				//alert();
				//alert(user._id)
				//alert(eventobj.mentors)
				//possible_mentors.push(user);
				possible_hosts.push({"username": user.username, "id":user._id, "checked":checked})
			});
				

	}
	
	return possible_hosts;
}
