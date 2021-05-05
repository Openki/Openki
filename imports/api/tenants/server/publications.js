import { Meteor } from 'meteor/meteor';

import { Tenants } from '/imports/api/tenants/tenants';

Meteor.publish('tenant', (tenantId) => Tenants.find(tenantId, { fields: Tenants.publicFields }));
