import { Template } from 'meteor/templating';
import { Tenants } from '/imports/api/tenants/tenants';

import './template.html';

Template.adminTenantsPage.helpers({
	tenants() {
		return Tenants.find();
	},
});
