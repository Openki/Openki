import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { logFactory } from '/imports/api/log/factory';

/** @type {Mongo.Collection<import('/imports/api/log/factory').LogEntity>} */
export const Log = logFactory.mongo(Mongo, Meteor.isServer, Meteor.settings.printLog);

export default Log;
