import { Meteor } from 'meteor/meteor';
import { Regions } from '/imports/api/regions/regions';

Meteor.publish('Regions', () => Regions.find());
