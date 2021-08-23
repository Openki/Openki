import PublicSettings from './PublicSettings';
import { RegionModel } from '/imports/api/regions/regions';

export function getSiteName(region?: RegionModel): string {
	if (region?.custom?.siteName) {
		return region.custom.siteName;
	}

	return PublicSettings.siteName;
}

export default getSiteName;
