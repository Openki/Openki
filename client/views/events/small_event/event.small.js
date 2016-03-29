Template.small_event.events({
	"mouseover a.-locationLink": function(event, template){
		template.$('.small_event').addClass('elevate_child');
	},
	"mouseout a.-locationLink": function(event, template){
		template.$('.small_event').removeClass('elevate_child');
	}
});

Template.small_event.rendered = function() {
	this.$('.-eventLocationTime').dotdotdot({
		height: 55,
		watch : "window",
	});
	this.$('.-eventTitle').dotdotdot({
		watch: "window",
	});
	this.$('.-eventDescription').dotdotdot({
		watch: "window",
	});
};
