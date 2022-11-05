import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';

import { JoinLinks } from './joinLinks';
import { Tenants } from '/imports/api/tenants/tenants';
import { ServerMethod } from '/imports/utils/ServerMethod';
import * as usersTenantsDenormalizer from '/imports/api/users/tenantsDenormalizer';

export const create = ServerMethod('joinLinks.create', (tenantId: string) => {
	check(tenantId, String);

	const tenant = Tenants.findOne(tenantId);
	if (!tenant) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	const user = Meteor.user();

	// Only current tenant admins (or instance admins) may draft other people into it
	if (!user || !tenant.editableBy(user)) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	const createdAt = new Date();
	const createdBy = user._id;

	// Update or insert
	JoinLinks.upsert(
		{
			// Selector
			tenant: tenantId,
		},
		{
			// Modifier
			$set: {
				tenant: tenantId,
				token: Random.secret(),
				createdAt,
				createdBy,
			},
		},
	);
});

export const remove = ServerMethod('joinLinks.remove', (tenantId: string) => {
	check(tenantId, String);

	const tenant = Tenants.findOne(tenantId);
	if (!tenant) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	// Only current tenant admins (or instance admins) may draft other people into it
	if (!tenant.editableBy(Meteor.user())) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	JoinLinks.remove({ tenant: tenantId });
});

export const join = ServerMethod('joinLinks.join', (tenantId: string, token: string) => {
	check(tenantId, String);
	check(token, String);

	const joinLink = JoinLinks.findOne({ tenant: tenantId, token });
	if (!joinLink) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	const userId = Meteor.userId();
	if (!userId) {
		throw new Meteor.Error(401, 'please log in');
	}

	Tenants.update(tenantId, { $addToSet: { members: userId } });

	usersTenantsDenormalizer.afterJoinLinkJoin(userId, tenantId);
});
