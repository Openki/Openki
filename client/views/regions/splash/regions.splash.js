Template.regionsSplash.onRendered(function () {
	this.$('#regionsSplash').modal('show');
});

Template.regionsSplash.events({
	'click .js-region-search': function(e, instance) {
		$(e.currentTarget).select();
	},

	'click .js-region-link, submit .js-region-search-form': function(e, instance) {
		var regionsSplash = instance.$('#regionsSplash');

		regionsSplash.modal('hide');
		regionsSplash.on('hidden.bs.modal', function() {
			Session.set('showRegionSplash', false);
		});
	},

	'click #loginForRegion': function(e, instance) {
		instance.$('#regionsSplash').modal('hide');

		var viewportWidth = Session.get('viewportWidth');
		var screenSM = SCSSVars.screenSM;
		if (viewportWidth <= screenSM) {
			$('.collapse').collapse('show');
		}

		setTimeout(function() {
			$('.loginButton').dropdown('toggle');
		}, 0);

		setTimeout(function() {
			$('#loginName').focus();
		}, 0);
	}
});
