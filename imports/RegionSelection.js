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
	var selectors =
		[ UrlTools.queryParam('region')
		, localStorage.getItem('region')
		].filter(Boolean);

	Tracker.autorun(function() {
		const user = Meteor.user();

		if (user) {
			// The region might have been chosen already because the user is logged-in.
			// See Accounts.onLogin().
			selectors.unshift(Session.get('region'));
		}

		if (user !== undefined) {
			// When the region is not provided we show a splash screen
			Session.set('showRegionSplash', selectors.length < 1);
		}
	});

	Meteor.subscribe('regions', function() {
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

		if (selectors.some(useAsRegion)) return;

		// Give up and ask the server to place us
		Meteor.call('autoSelectRegion', function(error, regionId) {
			if (useAsRegion(regionId)) return;

			// Give up
			useAsRegion('all');
		});
	});
};
