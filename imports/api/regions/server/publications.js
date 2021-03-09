import { Meteor } from 'meteor/meteor';
import Regions from '/imports/api/regions/regions';

Meteor.publish('regions', () => Regions.find({ tenant: { $in: Meteor.user()?.tenants || [] } }));
