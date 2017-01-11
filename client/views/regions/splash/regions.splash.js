Template.regionsSplash.onRendered(function () {
	var instance = this;
	instance.$('#regionsSplash').on('shown.bs.modal', function() {
		instance.$('.js-region-search').select();
	});
});
