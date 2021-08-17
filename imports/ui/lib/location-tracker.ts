import { Geodata, Regions } from '/imports/api/regions/regions';
import { Mongo } from 'meteor/mongo';

interface MarkerEntity {
	_id: string;
	loc: Geodata;
	main?: boolean;
	draggable?: boolean;
	/** Marks that have the center flage set are not displayed but used for anchoring the map */
	center?: boolean;
	proposed?: boolean;
	selected?: boolean;
	hover?: boolean;
	presetAddress?: string;
	name?: string;
}

export class LocationTracker {
	/** Local collection for in-memory storage */
	public markers = new Mongo.Collection<MarkerEntity>(null);

	setLocation(location: { loc: Geodata }, draggable?: boolean, soft?: boolean) {
		if (soft) {
			const marker = this.markers.findOne({ main: true });
			if (marker && location?.loc) {
				this.markers.update({ _id: marker._id }, { $set: { loc: location.loc, draggable } });
				return;
			}
		}
		this.markers.remove({ main: true });
		if (location?.loc) {
			this.markers.insert({
				loc: location.loc,
				main: true,
				draggable,
			});
		}
	}

	getLocation() {
		return this.markers.findOne({ main: true })?.loc;
	}

	setRegion(regionId: string) {
		const region = Regions.findOne(regionId);

		this.markers.remove({ center: true });
		if (region?.loc) {
			this.markers.insert({
				loc: region.loc,
				center: true,
			});
		}
	}
}

export default LocationTracker;
