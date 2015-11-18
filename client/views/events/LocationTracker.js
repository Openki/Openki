LocationTracker = function() {
	var markers = new Meteor.Collection(null);

	return {
		markers: markers,
		setLocation: function(location) {
			markers.remove({ main: true });
			if (location && location.loc) {
				markers.insert({
					loc: location.loc,
					main: true
				});
			}
		},
		setRegion: function(regionId) {
			var region = Regions.findOne(regionId);

			markers.remove({ center: true });
			if (region && region.loc) {
				markers.insert({
					loc: region.loc,
					center: true
				});
			}
		}
	};
};
