import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { logFactory } from '/imports/api/log/factory';

export const Log = logFactory.mongo(Mongo, Meteor.isServer, Meteor.settings.printLog);

export default Log;
