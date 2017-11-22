import Regions from '/imports/api/regions/regions.js';
import { Mongo } from 'meteor/mongo';

export default LocationTracker = function() {
	var markers = new Mongo.Collection(null);

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
