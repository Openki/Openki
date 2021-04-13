import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} AlertEnity
 * @property {string} _id              ID
 * @property {string} type
 * @property {string} message
 * @property {number} timeout  Integer
 */

/**
 * @type {Mongo.Collection<AlertEnity>}
 */
export const Alerts = new Mongo.Collection(null); // Local collection for in-memory storage

export default Alerts;
