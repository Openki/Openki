Template.small_event_withDate.events({
	"mouseover a.-locationLink": function(event, template){
		template.$('.small_event').addClass('elevate_child');
	},
	"mouseout a.-locationLink": function(event, template){
		template.$('.small_event').removeClass('elevate_child');
	}
});

Template.small_event_withDate.rendered = function() {
	this.$('.-eventLocationTime').dotdotdot({
		height: 75,
		watch : "window",
	});
	this.$('.-eventTitle').dotdotdot({
		watch: "window",
	});
	this.$('.-eventDescription').dotdotdot({
		watch: "window",
	});
};
