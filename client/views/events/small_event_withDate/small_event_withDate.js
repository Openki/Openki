Template.small_event_withDate.events({
	"mouseover a.-locationLink": function(event, template){
		template.$('.small_event').addClass('elevate_child');
	},
	"mouseout a.-locationLink": function(event, template){
		template.$('.small_event').removeClass('elevate_child');
	}
});

Template.small_event_withDate.rendered = function() {
	this.$('.event-small-header').dotdotdot({
		height: 75,
		watch : "window",
	});
	this.$('.event-small-title').dotdotdot({
		watch: "window",
	});
	this.$('.event-small-description').dotdotdot({
		watch: "window",
	});
};
