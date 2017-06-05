Template.eventCompact.onCreated(function() {
	this.withDate = this.parentInstance().data.withDate;
});

Template.eventCompact.helpers({
	eventCompactClasses: function() {
		var eventCompactClasses = [];
		if (Template.instance().withDate) {
			eventCompactClasses.push('has-date');
		}
		if (moment().isAfter(this.end)) {
			eventCompactClasses.push('is-past');
		}

		return eventCompactClasses.join(' ');
	},

	withDate: function() {
		return Template.instance().withDate;
	}
});

Template.eventCompact.events({
	'mouseover .js-venue-link, mouseout .js-venue-link': function(e, instance){
		instance.$('.event-compact').toggleClass('elevate_child');
	}
});

Template.eventCompact.rendered = function() {
	this.$('.event-compact').dotdotdot();
};
