import Regions from '/imports/api/regions/regions';
import { Mongo } from 'meteor/mongo';

const LocationTracker = function () {
	const markers = new Mongo.Collection(null);

	return {
		markers,
		setLocation(location, draggable, soft) {
			if (soft) {
				const marker = markers.findOne({ main: true });
				if (marker && location?.loc) {
					markers.update({ _id: marker._id }, { $set: { 'location.loc': location.loc, draggable } });
					return;
				}
			}
			markers.remove({ main: true });
			if (location?.loc) {
				markers.insert({
					loc: location.loc,
					main: true,
					draggable,
				});
			}
		},
		setRegion(regionId) {
			const region = Regions.findOne(regionId);

			markers.remove({ center: true });
			if (region?.loc) {
				markers.insert({
					loc: region.loc,
					center: true,
				});
			}
		},
	};
};

export default LocationTracker;
