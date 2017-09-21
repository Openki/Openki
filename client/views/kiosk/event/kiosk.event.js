Template.kioskEvent.helpers({
	timePeriod: function() {
		return Template.instance().parentInstance().data.timePeriod;
	},

	isOngoing: function() {
		return Template.instance().parentInstance().data.timePeriod == "ongoing";
	},

	isUpcoming: function() {
		return Template.instance().parentInstance().data.timePeriod == "upcoming";
	}
});

Template.kioskEvent.rendered = function() {
	this.$('.kiosk-event').dotdotdot();
};

Template.kioskEventLocation.helpers({
	showLocation: function() {
		// The location is shown when we have a location name and the location is not used as a filter
		return this.location
		    && this.location.name
		    && !Router.current().params.query.location;
	}
});
