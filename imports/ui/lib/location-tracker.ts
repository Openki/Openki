import { Geodata, Regions } from '/imports/api/regions/regions';
import { Mongo } from 'meteor/mongo';

export type PresetMarkerEntity = {
	preset: true;

	presetName?: string;
	presetAddress?: string;
	editor?: string;
};

export type ProposedMarkerEntity = {
	proposed: true;

	_id: string;
	loc: Geodata;

	presetAddress?: string;
	name?: string;
} & Partial<PresetMarkerEntity>;

export type SelectedMarkerEntity = {
	selected: true;
};

export type MainMarkerEntity = {
	main: true;

	_id: string;
	loc: Geodata;
	draggable?: boolean;
};

export type CenteredMarkerEntity = {
	/** Marks that have the center flage set are not displayed but used for anchoring the map */
	center: true;

	_id: string;
	loc: Geodata;
};

export type RemoveMarkerEntity = {
	remove: true;

	_id: string;
	loc: Geodata;
};

export type MarkerEntity = {
	_id: string;
	hover?: boolean;
} & (
	| MainMarkerEntity
	| CenteredMarkerEntity
	| RemoveMarkerEntity
	| ProposedMarkerEntity
	| PresetMarkerEntity
);

export class LocationTracker {
	/** Local collection for in-memory storage */
	public markers = new Mongo.Collection<MarkerEntity>(null);

	setLocation(location: { loc?: Geodata } | undefined, draggable?: boolean, soft?: boolean) {
		if (soft) {
			const marker = this.markers.findOne({ main: true }) as MainMarkerEntity;
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
		return (this.markers.findOne({ main: true }) as MainMarkerEntity)?.loc;
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
