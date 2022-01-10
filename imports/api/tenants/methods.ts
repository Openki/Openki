import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { TenantEntity, Tenants } from './tenants';
import { Users } from '/imports/api/users/users';
import * as usersTenantsDenormalizer from '/imports/api/users/tenantsDenormalizer';
import { ServerMethod } from '/imports/utils/ServerMethod';

export const create = ServerMethod('tenant.create', (changes: Pick<TenantEntity, 'name'>) => {
	check(changes, {
		name: String,
	});

	const user = Meteor.user();
	if (!user) {
		throw new Meteor.Error(401, 'please log in');
	}

	const set: Pick<TenantEntity, 'name' | 'members' | 'admins'> = {
		name: changes.name.trim().substring(0, 40),
		members: [user._id],
		admins: [user._id],
	};

	const tenantId = Tenants.insert(set);

	usersTenantsDenormalizer.afterTenantCreate(user._id, tenantId);

	return tenantId;
});

function membershipMutationPreconditionCheck(userId: string, tenantId: string) {
	check(userId, String);
	check(tenantId, String);

	const senderId = Meteor.userId();
	if (!senderId) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	const tenant = Tenants.findOne(tenantId);
	if (!tenant) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	// Only current tenant admins (or instance admins) may draft other people into it
	if (!tenant.editableBy(Meteor.user())) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	if (Users.find(userId, { limit: 1 }).count() === 0) {
		throw new Meteor.Error(404, 'User not found');
	}

	return tenant;
}

export const addMember = ServerMethod('tenant.addMember', (userId: string, tenantId: string) => {
	membershipMutationPreconditionCheck(userId, tenantId);

	Tenants.update(tenantId, { $addToSet: { members: userId } });

	usersTenantsDenormalizer.afterTenantAddMember(userId, tenantId);
});

export const removeMember = ServerMethod(
	'tenant.removeMember',
	(userId: string, tenantId: string) => {
		const tenant = membershipMutationPreconditionCheck(userId, tenantId);

		if (tenant.admins.includes(userId)) {
			throw new Meteor.Error(401, 'Not permitted, delete the member from the admin list first');
		}

		Tenants.update(tenantId, { $pull: { members: userId } });

		usersTenantsDenormalizer.afterTenantRemoveMember(userId, tenantId);
	},
);

export const addAdmin = ServerMethod('tenant.addAdmin', (userId: string, tenantId: string) => {
	membershipMutationPreconditionCheck(userId, tenantId);

	Tenants.update(tenantId, { $addToSet: { admins: userId, members: userId } });

	usersTenantsDenormalizer.afterTenantAddAdmin(userId, tenantId);
});

export const removeAdmin = ServerMethod(
	'tenant.removeAdmin',
	(userId: string, tenantId: string) => {
		membershipMutationPreconditionCheck(userId, tenantId);

		Tenants.update(tenantId, { $pull: { admins: userId } });

		usersTenantsDenormalizer.afterTenantRemoveAdmin(userId, tenantId);
	},
);
