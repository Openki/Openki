Template.regionsSplash.onRendered(function () {
	var instance = this;

	instance.$('#regionsSplash').modal('show');
	instance.$('#regionsSplash').on('shown.bs.modal', function() {
		instance.$('.js-region-search').select();
	});
});

Template.regionsSplash.events({
	'click .js-region-link, submit .js-region-search-form': function(e, instance) {
		var regionsSplash = instance.$('#regionsSplash');

		regionsSplash.modal('hide');
		regionsSplash.on('hidden.bs.modal', function() {
			Session.set('regionGuessed', false);
		});
	}
});
