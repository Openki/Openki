import { Meteor } from 'meteor/meteor';

import Version from '../version.js';

Meteor.publish('version', () => Version.find());
