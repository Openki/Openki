Template.eventSmallList.onCreated(function() {
	this.headerHeight = this.data.withDate ? 75 : 55;
});

Template.eventSmall.events({
	"mouseover .js-location-link": function(event, template){
		template.$('.event-small').addClass('elevate_child');
	},
	"mouseout .js-location-link": function(event, template){
		template.$('.event-small').removeClass('elevate_child');
	}
});

Template.eventSmall.helpers({
	withDate: function(){
		return Template.instance().parentInstance().data.withDate;
	}
});

Template.eventSmall.rendered = function() {
	this.$('.event-small-header').dotdotdot({
		height: this.parentInstance().headerHeight,
		watch : "window",
	});
	this.$('.event-small-title').dotdotdot({
		watch: "window",
	});
	this.$('.event-small-description').dotdotdot({
		watch: "window",
	});
};
