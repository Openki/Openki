import { Meteor } from 'meteor/meteor';

import { logFactory } from '/imports/api/log/factory';

import { PrivateSettings } from '/imports/utils/PrivateSettings';

export const Log = logFactory.mongo(Meteor.isServer, PrivateSettings.printLog);

export default Log;
