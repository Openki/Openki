import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';
import { assert } from 'chai';

import { Tenants } from './tenants';
import { Users } from '../users/users';

if (Meteor.isClient) {
	describe('Tenant', () => {
		describe('Update membership', () => {
			it('should allow tenant admins to add member', async function () {
				this.timeout(5000);

				const tenantId = '03396e52b5'; // Kopf

				(await MeteorAsync.subscribeAsync('userSearch', 'Regula')).stop(); // load user from server
				const userId = Users.findOne({ username: 'Regula' })._id;

				await MeteorAsync.loginWithPasswordAsync('Kopf', 'greg');

				(await MeteorAsync.subscribeAsync('tenant', tenantId)).stop(); // load tenant from server
				let tenant = Tenants.findOne(tenantId);

				assert.notInclude(tenant.members, userId);

				await MeteorAsync.callAsync('tenant.updateMembership', userId, tenantId, true);

				(await MeteorAsync.subscribeAsync('tenant', tenantId)).stop(); // reload tenant from server
				tenant = Tenants.findOne(tenantId);

				assert.include(tenant.members, userId);
			});

			it('should allow tenant admins to remove member', async function () {
				this.timeout(5000);

				const tenantId = '03396e52b5'; // Kopf

				(await MeteorAsync.subscribeAsync('userSearch', 'Regula')).stop(); // load user from server
				const userId = Users.findOne({ username: 'Regula' })._id;

				await MeteorAsync.loginWithPasswordAsync('Kopf', 'greg');

				(await MeteorAsync.subscribeAsync('tenant', tenantId)).stop(); // load tenant from server
				let tenant = Tenants.findOne(tenantId);

				assert.include(tenant.members, userId);

				await MeteorAsync.callAsync('tenant.updateMembership', userId, tenantId, false);

				(await MeteorAsync.subscribeAsync('tenant', tenantId)).stop(); // reload tenant from server
				tenant = Tenants.findOne(tenantId);

				assert.notInclude(tenant.members, userId);
			});

			it('should not allow normal users to add member', async function () {
				this.timeout(5000);

				const tenantId = '03396e52b5'; // Kopf

				(await MeteorAsync.subscribeAsync('userSearch', 'Regula')).stop(); // load user from server
				const userId = Users.findOne({ username: 'Regula' })._id;

				await MeteorAsync.loginWithPasswordAsync('Kopf', 'greg');

				(await MeteorAsync.subscribeAsync('tenant', tenantId)).stop(); // load tenant from server
				const tenant = Tenants.findOne(tenantId);

				assert.notInclude(tenant.members, userId);

				await MeteorAsync.loginWithPasswordAsync('Normalo', 'greg');

				let hasFailed = false;
				try {
					await MeteorAsync.callAsync('tenant.updateMembership', userId, tenantId, true);
				} catch (err) {
					if (err) {
						hasFailed = true;
					}
				}
				assert.isTrue(
					hasFailed,
					'tenant.updateMembership throws an error on for none tenant admins',
				);
			});
		});
	});
}
