import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} InvitationEntity
 * @property {string} _id ID
 * @property {string} tenant tenant id
 * @property {string} to
 * @property {string} token
 * @property {'created' | 'send' | 'accepted' | 'failed' } status
 * @property {string} [acceptedBy] The user who has accepted the invitation. (by state 'accepted')
 * @property {Date} createdAt
 * @property {string} createdBy user id
 */

/**
 * @extends {Mongo.Collection<InvitationEntity>}
 */
export class InvitationsCollection extends Mongo.Collection {
	constructor() {
		super('Invitations');

		if (Meteor.isServer) {
			this._ensureIndex({ tenant: 1 });
			this._ensureIndex({ token: 1, to: 1 });
		}
	}
}

export const Invitations = new InvitationsCollection();

export default Invitations;
