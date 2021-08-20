import { Template } from 'meteor/templating';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/tenants/settings/tenant-settings';
import '/imports/ui/components/tenants/regions/tenant-regions';

import './tenant-details.html';

Template.tenantDetails.helpers({
	editingSettings() {
		const { tenant } = Template.instance().data;
		return tenant.editableBy(Meteor.user());
	},
});
