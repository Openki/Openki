import { Template } from 'meteor/templating';
import { Tenants } from '/imports/api/tenants/tenants';

import './tenants.html';

Template.tenants.helpers({
	tenants() {
		return Tenants.find();
	},
});
