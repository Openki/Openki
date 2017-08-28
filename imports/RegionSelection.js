export default RegionSelection = {};

/** List of routes that show different results when the region changes.
  */
RegionSelection.regionDependentRoutes =
	['home', 'find', 'calendar', 'venueMap'];

/** Subscribe to list of regions and configure the regions
  * This checks client storage for a region setting. When there is no previously
  * selected region, we ask the server to do geolocation. If that fails too,
  * we just set the region to 'all regions'. */
RegionSelection.init = function() {
	// We assume the initial onLogin() callback comes before the regions' ready.
	// We have no guarantee for this however!
	Accounts.onLogin(function() {
		var user = Meteor.user();

		var regionId = user.profile.regionId;
		if (regionId) Session.set('region', regionId);
	});

	Meteor.subscribe('regions', function() {
		var selectors =
			[ Session.get('region')
			, UrlTools.queryParam('region')
			, localStorage.getItem('region')
			].filter(Boolean);

		var useAsRegion = function(regionId) {
			if (!regionId) return;
			if (regionId == 'all') {
				Session.set("region", regionId);
				return true;
			}
			if (Regions.findOne({ _id: regionId })) {
				Session.set("region", regionId);
				return true;
			}

			var region = Regions.findOne({ name: regionId });
			if (region) {
				Session.set("region", region._id);
				return true;
			}
			return false;
		};

		// If any of these regions are usable we stop here
		if (selectors.some(useAsRegion)) return;

		// If no region has been selected previously, we show the splash-screen.
		Session.set('showRegionSplash', selectors.length < 1);

		// Ask the server to place us so the splash=screen has our best
		// guess selected.
		Meteor.call('autoSelectRegion', function(error, regionId) {
			if (useAsRegion(regionId)) return;

			// Give up
			useAsRegion('all');
		});
	});
};
