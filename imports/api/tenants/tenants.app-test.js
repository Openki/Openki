import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';
import { assert } from 'chai';

import { Tenants } from './tenants';
import * as TenantsMethods from './methods';
import { Users } from '../users/users';

if (Meteor.isClient) {
	describe('Tenant', () => {
		describe('Update membership', () => {
			it('should allow tenant admins to add member', async function () {
				this.timeout(5000);

				const tenantId = '03396e52b5'; // Kopf

				(await MeteorAsync.subscribe('userSearch', 'Regula')).stop(); // load user from server
				const userId = Users.findOne({ username: 'Regula' })._id;

				await MeteorAsync.loginWithPassword('Kopf', 'greg');

				(await MeteorAsync.subscribe('tenant', tenantId)).stop(); // load tenant from server
				let tenant = Tenants.findOne(tenantId);

				assert.notInclude(tenant.members, userId);

				await TenantsMethods.addMember(userId, tenantId);

				(await MeteorAsync.subscribe('tenant', tenantId)).stop(); // reload tenant from server
				tenant = Tenants.findOne(tenantId);

				assert.include(tenant.members, userId);
			});

			it('should allow tenant admins to remove member', async function () {
				this.timeout(5000);

				const tenantId = '03396e52b5'; // Kopf

				(await MeteorAsync.subscribe('userSearch', 'Regula')).stop(); // load user from server
				const userId = Users.findOne({ username: 'Regula' })._id;

				await MeteorAsync.loginWithPassword('Kopf', 'greg');

				(await MeteorAsync.subscribe('tenant', tenantId)).stop(); // load tenant from server
				let tenant = Tenants.findOne(tenantId);

				assert.include(tenant.members, userId);

				await TenantsMethods.removeMember(userId, tenantId);

				(await MeteorAsync.subscribe('tenant', tenantId)).stop(); // reload tenant from server
				tenant = Tenants.findOne(tenantId);

				assert.notInclude(tenant.members, userId);
			});

			it('should not allow normal users to add member', async function () {
				this.timeout(5000);

				const tenantId = '03396e52b5'; // Kopf

				(await MeteorAsync.subscribe('userSearch', 'Regula')).stop(); // load user from server
				const userId = Users.findOne({ username: 'Regula' })._id;

				await MeteorAsync.loginWithPassword('Kopf', 'greg');

				(await MeteorAsync.subscribe('tenant', tenantId)).stop(); // load tenant from server
				const tenant = Tenants.findOne(tenantId);

				assert.notInclude(tenant.members, userId);

				await MeteorAsync.loginWithPassword('Normalo', 'greg');

				let hasFailed = false;
				try {
					await TenantsMethods.addMember(userId, tenantId);
				} catch (err) {
					if (err) {
						hasFailed = true;
					}
				}
				assert.isTrue(
					hasFailed,
					'tenant.addMember throws an error on for none tenant admins',
				);
			});
		});
	});
}
