import { Regions } from '/imports/api/regions/regions';
import { Mongo } from 'meteor/mongo';
/** @typedef {import('/imports/api/regions/regions').Geodata} Geodata */

/**
 * @typedef {Object} MarkerEntity
 * @property {string} _id
 * @property {Geodata} loc
 * @property {boolean} [main]
 * @property {boolean} [draggable]
 * @property {boolean} [center] Marks that have the center flage set are not displayed but used for anchoring the map
 * @property {boolean} [proposed]
 * @property {boolean} [selected]
 * @property {boolean} [hover]
 * @property {string} [presetAddress]
 * @property {string} [name]
 */

export const LocationTracker = function () {
	/** @type {Mongo.Collection<MarkerEntity>} */
	const markers = new Mongo.Collection(null); // Local collection for in-memory storage

	return {
		markers,
		/**
		 * @param {{ loc: Geodata; }} location
		 * @param {boolean} [draggable]
		 * @param {boolean} [soft]
		 */
		setLocation(location, draggable, soft) {
			if (soft) {
				const marker = markers.findOne({ main: true });
				if (marker && location?.loc) {
					markers.update({ _id: marker._id }, { $set: { loc: location.loc, draggable } });
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
		/**
		 * @param {string} regionId
		 */
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
