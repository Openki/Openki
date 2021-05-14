import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';
import { assert } from 'chai';

import { Groups } from '/imports/api/groups/groups';

if (Meteor.isClient) {
	describe('Group save', () => {
		it('should allow to edit the group name', async function () {
			this.timeout(5000);

			const randomName = `TEST${1000 + Math.floor(Math.random() * 9000)}`;
			const editRandomName = `TEST${1000 + Math.floor(Math.random() * 9000)}`;

			await MeteorAsync.loginWithPassword('Seee', 'greg');

			const newGroup = {
				name: randomName,
				short: `${randomName} short`,
				claim: `${randomName} claim`,
				description: `${randomName} description`,
			};

			const groupId = await MeteorAsync.call('group.save', 'create', newGroup);

			assert.isString(groupId, 'group.save returns an groupId string');

			await MeteorAsync.call('group.save', groupId, { name: editRandomName });

			const handle = await MeteorAsync.subscribe('group', groupId);
			handle.stop();

			const group = Groups.findOne(groupId);

			assert.equal(group.name, editRandomName);
		});

		it('does not allow setting a empty group name', async function () {
			this.timeout(5000);

			const randomName = `TEST${1000 + Math.floor(Math.random() * 9000)}`;

			await MeteorAsync.loginWithPassword('Seee', 'greg');

			const newGroup = {
				name: randomName,
				short: `${randomName} short`,
				claim: `${randomName} claim`,
				description: `${randomName} description`,
			};

			const groupId = await MeteorAsync.call('group.save', 'create', newGroup);

			assert.isString(groupId, 'group.save returns an groupId string');

			let hasFailed = false;
			try {
				await MeteorAsync.call('group.save', groupId, { name: '' });
			} catch (err) {
				if (err) {
					hasFailed = true;
				}
			}
			assert.isTrue(hasFailed, 'group.save throws an error on empty name');
		});
	});
}
