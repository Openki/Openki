import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { logFactory } from '/imports/api/log/factory';

export default Log = logFactory.mongo(Mongo, Meteor.isServer, Meteor.settings.printLog);
