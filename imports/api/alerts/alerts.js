import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} AlertEnity
 * @property {string} _id             ID
 * @property {object} message
 * @property {string} message.type
 * @property {string} message.message
 * @property {number} message.timeout  Integer
 */

const Alerts = new Mongo.Collection(null);

export default Alerts;
