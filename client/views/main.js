Template.ticker.helpers({
	marquee: function() {
		return Meteor.settings && Meteor.settings.public && Meteor.settings.public.marquee;
	}
});
