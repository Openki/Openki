import { Meteor } from 'meteor/meteor';
import Regions from '/imports/api/regions/regions';

import { visibleTenants } from '/imports/utils/visible-tenants';

Meteor.publish('Regions', () => Regions.find({ tenant: { $in: visibleTenants() } }));
