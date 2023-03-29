import { useTracker } from 'meteor/react-meteor-data';
import { Regions } from '/imports/api/regions/regions';

export function useCurrentRegion() {
	return useTracker(() => Regions.currentRegion());
}
