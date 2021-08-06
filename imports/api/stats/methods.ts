import Stats from '/imports/api/stats/stats';
import { ServerMethod } from '/imports/utils/ServerMethod';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

export const region = ServerMethod('stats.region', (regionId: string) => {
	if (UserPrivilegeUtils.privilegedTo('admin')) {
		const regionFilter = regionId === 'all_regions' ? '' : regionId;
		return Stats.getRegionStats(regionFilter);
	}
	return {};
});

export default region;
