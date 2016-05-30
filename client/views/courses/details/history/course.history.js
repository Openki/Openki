Template.coursehistory.helpers({
	events_list_past: function() {
		var today= new Date();
		return Events.find({ courseId: this.course._id, start: {$lt:today} }, { sort: {start: -1} } );
	},
});

Template.coursehistory.events({
	"mouseover .coursehistory-event": function(event, template){
		$("." + this._id).addClass('navbar-link-active');
	},
	"mouseout .coursehistory-event": function(event, template){
		$("." + this._id).removeClass('navbar-link-active');
	}
});
