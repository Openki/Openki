import { Meteor } from 'meteor/meteor';

import Version from '/imports/api/version/version';

Meteor.publish('version', () => Version.find());
