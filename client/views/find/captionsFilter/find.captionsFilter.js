Template.captionsFilter.onCreated(function() {
	this.courseStates = [
		{
			cssClass: 'is-proposal',
			mfString: mf('filterCaptions.proposal', 'Proposal'),
			filterName: 'proposal'
		},
		{
			cssClass: 'has-upcoming-events',
			mfString: mf('filterCaptions.upcoming', 'Upcoming'),
			filterName: 'upcomingEvent'
		},
		{
			cssClass: 'has-past-events',
			mfString: mf('filterCaptions.passed', 'Passed'),
			filterName: 'pastEvent'
		},
	];
});

Template.captionsFilter.helpers({
	courseStates: function() {
		return Template.instance().courseStates;
	},

	classes: function(state) {
		var classes = [];
		var instance = Template.instance();
		var parentInstance = instance.parentInstance();

		classes.push(state.cssClass);

		if (parentInstance.filter.get('state') == state.filterName) {
			classes.push('active');
		}

		return classes.join(' ');
	}
});

Template.captionsFilter.events({
	'click .js-filter-caption': function(e, instance) {
		var caption = instance.$(e.currentTarget);
		var parentInstance = instance.parentInstance();
		var filterName = caption.data('filter-name');

		parentInstance
			.filter
			.toggle('state', filterName)
			.done();

		parentInstance.updateUrl();
	}
});
