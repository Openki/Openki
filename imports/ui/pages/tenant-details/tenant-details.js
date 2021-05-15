import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/tenants/settings/tenant-settings';

import './tenant-details.html';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

Template.tenantDetails.onCreated(function () {
	const instance = this;

	instance.busy(false);

	instance.editingSettings = new ReactiveVar(false);

	instance.autorun(() => {
		const editingSettings = UserPrivilegeUtils.privilegedTo('admin');
		instance.editingSettings.set(editingSettings);
	});
});

Template.tenantDetails.helpers({
	editingSettings() {
		const instance = Template.instance();
		return instance.editingSettings.get();
	},
});
