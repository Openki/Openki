import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { TenantEntity, Tenants } from '/imports/api/tenants/tenants';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { FieldSort, FieldSortPattern } from '/imports/utils/sort-spec';

Meteor.publish('tenant', function (tenantId: string) {
	check(tenantId, String);

	const user = Meteor.user();

	if (!user) {
		this.ready();
		return undefined;
	}

	const filter: Mongo.Selector<TenantEntity> = { _id: tenantId };

	// Only members of a tenant or admins can see a tenant
	if (!UserPrivilegeUtils.privileged(user, 'admin')) {
		filter.members = user._id;
	}

	// Only admins can see all tenant admins. Note: Admin privileg is not something that is
	// likely to happen and reactive changes are not needed.
	const showAdminsFields =
		UserPrivilegeUtils.privileged(user, 'admin') || user.isTenantAdmin(tenantId) ? 1 : 0;

	return Tenants.find(filter, { fields: { ...Tenants.publicFields, admins: showAdminsFields } });
});

Meteor.publish(
	'Tenants.findFilter',
	function (
		find: {
			/** Limit to tenants where logged-in user is a admin */
			adminOf?: boolean;
		} = {},
		limit = 0,
		skip = 0,
		sort?: FieldSort[],
	) {
		check(limit, Match.Optional(Match.Integer));
		check(skip, Match.Optional(Match.Integer));
		check(sort, Match.Optional([FieldSortPattern]));

		const filter = { ...find };

		return Tenants.findFilter(filter, limit, skip, sort);
	},
);
