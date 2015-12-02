LocationTracker = function() {
	var markers = new Meteor.Collection(null);

	return {
		markers: markers,
		setLocation: function(location, draggable, soft) {
			if (soft) {
				var marker = markers.findOne({ main: true});
				if (marker && location && location.loc) {
					markers.update({ _id: marker._id }, { $set: { 'location.loc': location.loc, draggable: draggable } });
					return;
				}
			}
			markers.remove({ main: true });
			if (location && location.loc) {
				markers.insert({
					loc: location.loc,
					main: true,
					draggable: draggable
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
