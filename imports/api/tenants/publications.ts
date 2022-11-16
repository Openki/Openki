import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { FindFilter, TenantEntity, Tenants } from '/imports/api/tenants/tenants';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { ServerPublishMany } from '/imports/utils/ServerPublish';
import { FieldSort } from '/imports/utils/sort-spec';
import { ServerPublish } from '/imports/utils/ServerPublishBlaze';

export const [details, useDetails] = ServerPublishMany(
	'tenant',
	(tenantId: string) => {
		check(tenantId, String);

		const user = Meteor.user();

		if (!user) {
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
	},
	(tenantId: string) => {
		const user = Meteor.user();

		if (!user) {
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

		return Tenants.findOne(filter, {
			fields: { ...Tenants.publicFields, admins: showAdminsFields },
		});
	},
);

export const findFilter = ServerPublish(
	'Tenants.findFilter',
	(find?: FindFilter, limit?: number, skip?: number, sort?: FieldSort[]) =>
		Tenants.findFilter(find, limit, skip, sort),
);
