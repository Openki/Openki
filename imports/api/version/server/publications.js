import { Meteor } from 'meteor/meteor';

import Version from '../version';

Meteor.publish('version', () => Version.find());
