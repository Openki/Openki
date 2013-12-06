Template.course_events.events_list = function() {
	Meteor.subscribe('events'); // should not be here
	var course=this;
	return Events.find({course_id:this._id}).map(function(event){
		return {course: course, event: event}
	});
};

Template.course_events.new_event = function() {
	return {course: this, event: {}}
}


Template.course_events.events({

	'click input.addEvent': function () {
		if(Meteor.userId()) {
			Session.set("isAddingEvent", true);
			Session.set("isEditingEvent", false);
		}
		else {
			alert("Security robot say: sign in");
		}
	},
	'click input.cancelEditEvent': function () {
		Session.set("isEditingEvent", false);
		Session.set("isAddingEvent", false);
	},
	
	'click input.eventDelete': function () {
		if (confirm("delete event "+"'"+this.event.title+"'"+"?")) {
			Events.remove(this.event._id);
		}
	},
	'click input.eventEdit': function () {
		Session.set("isEditingEvent", this.event._id);
		Session.set("isAddingEvent", false);
	}
})

Template.course_events.isAddingEvent = function () {
	return Session.get("isAddingEvent");
};

Template.course_events.isEditingEvent = function () {
	if(Session.get("isEditingEvent")){
		return Session.get("isEditingEvent")===this.event._id;
	}
};

