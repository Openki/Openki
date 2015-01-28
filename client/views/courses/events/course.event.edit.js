



Template.course_event_edit.helpers({
	needsRole: function(role) {
		if (!this.course) return false;
		return this.course.roles.indexOf(role) != -1
	},

	possible_mentors: function() {
		var possible_mentors=[];
		var mentorList = havingRole(this.course.members, 'mentor')
		var eventobj=this.event;
		_.each(mentorList, function (userid) {
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

		return possible_mentors;
	},

	possible_hosts: function() {
		var possible_hosts=[]
		if (this.course) {
			var hostList = havingRole(this.course.members, 'host')
			var eventobj=this.event;
			_.each(hostList, function (userid) {
				var user = Meteor.users.findOne({_id: userid})
				if (!user) return;
				if(eventobj._id){
					if(eventobj.host!=user._id){
						var checked ="";
					}else{
						var checked ="checked";
					};
				}
				possible_hosts.push({"username": user.username, "id":user._id, "checked":checked})
			});
		}
		return possible_hosts;
	}
});