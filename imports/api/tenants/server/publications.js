import { Meteor } from 'meteor/meteor';

import { Tenants } from '../tenants';

Meteor.publish('tenant', (tenantId) => Tenants.find(tenantId));
