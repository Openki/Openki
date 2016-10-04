Template.eventCompact.events({
	"mouseover .js-location-link": function(event, template){
		template.$('.event-compact').addClass('elevate_child');
	},
	"mouseout .js-location-link": function(event, template){
		template.$('.event-compact').removeClass('elevate_child');
	}
});

Template.eventCompact.helpers({
	withDate: function() {
		return Template.instance().parentInstance().data.withDate;
	},

	pastEvent: function() {
		return moment().isAfter(this.end);
	}
});

Template.eventCompact.rendered = function() {
	this.$('.event-compact').dotdotdot();
};
