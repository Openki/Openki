import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} TenantEntity
 * @property {string} _id ID
 * @property {string} name
 * @property {string[]} members List of userIds
 */

/**
 * @type {Mongo.Collection<TenantEntity>}
 */
const Tenants = new Mongo.Collection('Tenants');

export { Tenants as default, Tenants };
