import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { Tenants } from '/imports/api/tenants/tenants';
import { UserModel, Users } from '/imports/api/users/users';

import RouterAutoscroll from '/imports/ui/lib/router-autoscroll';

import * as TenantsMethods from '/imports/api/tenants/methods';
import UserSearchPrefix from '/imports/utils/user-search-prefix';

import '/imports/ui/components/buttons';
import '/imports/ui/components/invitations';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'tenantSettings',
	never,
	{ memberSearch: ReactiveVar<string>; adminSearch: ReactiveVar<string> }
>;

const template = Template.tenantSettings;

template.onCreated(function () {
	const instance = this;

	instance.busy(false);

	instance.memberSearch = new ReactiveVar('');
	instance.autorun(() => {
		const search = instance.memberSearch.get();
		if (search.length > 0) {
			instance.subscribe('userSearch', search);
		}
	});

	instance.adminSearch = new ReactiveVar('');
	instance.autorun(() => {
		const search = instance.adminSearch.get();
		if (search.length > 0) {
			instance.subscribe('userSearch', search);
		}
	});
});

template.helpers({
	tenantName() {
		const tenant = Tenants.findOne(Router.current().params._id);
		return tenant?.name;
	},
	members() {
		const tenant = Tenants.findOne(Router.current().params._id);
		return tenant?.members.filter((m) => !tenant?.admins?.includes(m));
	},
	foundMembers() {
		const instance = Template.instance();

		const search = instance.memberSearch.get();
		if (search === '') {
			return false;
		}

		const tenant = Tenants.findOne(Router.current().params._id);
		return UserSearchPrefix(search, { exclude: tenant?.members, limit: 30 });
	},
	foundAdmins() {
		const instance = Template.instance();

		const search = instance.adminSearch.get();
		if (search === '') {
			return false;
		}

		const tenant = Tenants.findOne(Router.current().params._id);
		return UserSearchPrefix(search, { exclude: tenant?.admins, limit: 30 });
	},
});

template.events({
	'keyup .js-search-members'(_event, instance) {
		instance.memberSearch.set(instance.$('.js-search-members').val() as string);
	},

	async 'click .js-member-add-btn'(this: UserModel) {
		RouterAutoscroll.cancelNext();

		const memberId = this._id;
		const tenantId = Router.current().params._id;
		try {
			await TenantsMethods.addMember(memberId, tenantId);
			const memberName = Users.findOne(memberId)?.username;
			const tenantName = Tenants.findOne(tenantId)?.name;
			Alert.success(
				i18n(
					'tenantSettings.memberAdded',
					'"{MEMBER}" has been added as a member to the organization "{TENANT}"',
					{ MEMBER: memberName, TENANT: tenantName },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not add member');
		}
	},

	async 'click .js-member-remove-btn'(this: UserModel) {
		RouterAutoscroll.cancelNext();

		const memberId = `${this}`;
		const tenantId = Router.current().params._id;
		try {
			await TenantsMethods.removeMember(memberId, tenantId);

			const memberName = Users.findOne(memberId)?.username;
			const tenantName = Tenants.findOne(tenantId)?.name;
			Alert.success(
				i18n(
					'tenantSettings.memberRemoved',
					'"{MEMBER}" has been removed from to the organization "{TENANT}"',
					{ MEMBER: memberName, TENANT: tenantName },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not remove member');
		}
	},

	'keyup .js-search-admins'(_event, instance) {
		instance.adminSearch.set(instance.$('.js-search-admins').val() as string);
	},

	async 'click .js-admin-add-btn'(this: UserModel) {
		RouterAutoscroll.cancelNext();

		const adminId = this._id;
		const tenantId = Router.current().params._id;
		try {
			await TenantsMethods.addAdmin(adminId, tenantId);
			const adminName = Users.findOne(adminId)?.username;
			const tenantName = Tenants.findOne(tenantId)?.name;
			Alert.success(
				i18n(
					'tenantSettings.adminAdded',
					'"{ADMIN}" has been added as an admin to the organization "{TENANT}"',
					{ ADMIN: adminName, TENANT: tenantName },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not add admin');
		}
	},

	async 'click .js-admin-remove-btn'(this: UserModel) {
		RouterAutoscroll.cancelNext();

		const adminId = `${this}`;
		const tenantId = Router.current().params._id;
		try {
			await TenantsMethods.removeAdmin(adminId, tenantId);

			const adminName = Users.findOne(adminId)?.username;
			const tenantName = Tenants.findOne(tenantId)?.name;
			Alert.success(
				i18n(
					'tenantSettings.adminRemoved',
					'"{ADMIN}" has been removed as an admin from to the organization "{TENANT}"',
					{ ADMIN: adminName, TENANT: tenantName },
				),
			);
		} catch (err) {
			Alert.serverError(err, 'Could not remove admin');
		}
	},
});
