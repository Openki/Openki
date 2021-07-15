import { Meteor } from 'meteor/meteor';

import { logFactory } from '/imports/api/log/factory';

export const Log = logFactory.mongo(Meteor.isServer, Meteor.settings.printLog);

export default Log;
