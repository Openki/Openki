Template.coursehistory.helpers({
	events_list_past: function() {
		var today= new Date();
		return Events.find({course_id:this.course._id, start: {$lt:today}}, {sort: {start: -1} } );
	},
	has_past_events: function() {
		var today= new Date();
		var eventos = Events.find({course_id:this.course._id, start: {$lt:today}}, {sort: {start: -1} } ).count();
		if (eventos !== 0) return true;
	}
});

Template.coursehistory.events({
	"mouseover .coursehistory-event": function(event, template){
		 $("." + this._id).addClass('active');
	},
	"mouseout .coursehistory-event": function(event, template){
		 $("." + this._id).removeClass('active');
	}
});
