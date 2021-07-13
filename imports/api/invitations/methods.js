import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';

import { Invitations } from './invitations';
/** @typedef {import('./invitations').InvitationEntity} InvitationEntity */
import { Tenants } from '../tenants/tenants';
/** @typedef {import('../tenants/tenants').TenantEntity} TenantEntity */
import { ServerMethod } from '/imports/utils/ServerMethod';

/**
 * @param {string} tenantId
 */
function tenantMutationPreconditionCheck(tenantId) {
	check(tenantId, String);

	const tenant = Tenants.findOne(tenantId);
	if (!tenant) {
		throw new Meteor.Error(401, 'Not permitted');
	}

	// Only current tenant admins (or instance admins) may draft other people into it
	if (!tenant.editableBy(Meteor.user())) {
		throw new Meteor.Error(401, 'Not permitted');
	}
}

export const createMany = ServerMethod('invitation.createMany', (tenantId, emails) => {
	check(emails, [String]);

	tenantMutationPreconditionCheck(tenantId);

	const createdAt = new Date();
	const createdBy = Meteor.userId();

	emails
		.map(
			(e) =>
				/** @type {Mongo.OptionalId<InvitationEntity>} */ ({
					tenant: tenantId,
					to: e,
					token: Random.secret(),
					status: 'created',
					createdAt,
					createdBy,
				}),
		)
		.forEach((i) => {
			Invitations.insert(i);
		});
});

export default createMany;
