LocationTracker = function() {
	var markers = new Meteor.Collection(null);

	return {
		markers: markers,
		setLocation: function(location) {
			markers.remove({ main: true });
			if (location && location.loc) {
				var loc = $.extend(location.loc, { main: true });
				delete loc._id;
				markers.insert(loc);
			}
		},
		setRegion: function(region) {
			markers.remove({ center: true });
			if (region && region.loc) {
				var center = $.extend(region.loc, { center: true })
				markers.insert(center);
			}
		}
	};
};
