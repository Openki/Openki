Template.eventList.onCreated(function() {
	this.headerHeight = this.data.withDate ? 75 : 55;
});

Template.eventCompact.events({
	"mouseover .js-location-link": function(event, template){
		template.$('.event-compact').addClass('elevate_child');
	},
	"mouseout .js-location-link": function(event, template){
		template.$('.event-compact').removeClass('elevate_child');
	}
});

Template.eventCompact.helpers({
	withDate: function(){
		return Template.instance().parentInstance().data.withDate;
	}
});

Template.eventCompact.rendered = function() {
	this.$('.event-compact-header').dotdotdot({
		height: this.parentInstance().headerHeight,
		watch : "window",
	});
	this.$('.event-compact-title').dotdotdot({
		watch: "window",
	});
	this.$('.event-compact-description').dotdotdot({
		watch: "window",
	});
};
