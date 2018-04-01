import { Meteor } from 'meteor/meteor';
import Regions from '/imports/api/regions/regions.js';

Meteor.publish ('regions', () => Regions.find());
