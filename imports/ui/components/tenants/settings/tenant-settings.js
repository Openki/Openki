import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Tenants } from '/imports/api/tenants/tenants';
import { Users } from '/imports/api/users/users';
import UserSearchPrefix from '/imports/utils/user-search-prefix';
import { MeteorAsync } from '/imports/utils/promisify';

import '/imports/ui/components/buttons/buttons';

import './tenant-settings.html';

Template.tenantSettings.onCreated(function () {
	const instance = this;

	instance.busy(false);

	instance.userSearch = new ReactiveVar('');

	instance.autorun(() => {
		const search = instance.userSearch.get();
		if (search.length > 0) {
			Meteor.subscribe('userSearch', search);
		}
	});
});

Template.tenantSettings.helpers({
	foundUsers() {
		const instance = Template.instance();

		const search = instance.userSearch.get();
		if (search === '') {
			return false;
		}

		const tenant = Tenants.findOne(Router.current().params._id);
		return UserSearchPrefix(search, { exclude: tenant.members, limit: 30 });
	},
});

Template.tenantSettings.events({
	'keyup .js-search-users'(event, instance) {
		instance.userSearch.set(instance.$('.js-search-users').val());
	},

	async 'click .js-member-add-btn'() {
		const memberId = this._id;
		const tenantId = Router.current().params._id;
		try {
			await MeteorAsync.callAsync('tenant.updateMembership', memberId, tenantId, true);
			const memberName = Users.findOne(memberId)?.username;
			const tenantName = Tenants.findOne(tenantId).name;
			Alert.success(
				mf(
					'tenantSettings.memberAdded',
					{ MEMBER: memberName, TENANT: tenantName },
					'"{MEMBER}" has been added as a member to the tenant "{TENANT}"',
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not add member');
		}
	},

	async 'click .js-member-remove-btn'() {
		const memberId = `${this}`;
		const tenantId = Router.current().params._id;
		try {
			await MeteorAsync.callAsync('tenant.updateMembership', memberId, tenantId, false);

			const memberName = Users.findOne(memberId)?.username;
			const tenantName = Tenants.findOne(tenantId).name;
			Alert.success(
				mf(
					'tenantSettings.memberRemoved',
					{ MEMBER: memberName, TENANT: tenantName },
					'"{MEMBER}" has been removed from to the tenant "{TENANT}"',
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not remove member');
		}
	},
});
