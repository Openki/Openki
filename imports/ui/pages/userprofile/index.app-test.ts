import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';

import { Users } from '/imports/api/users/users';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('userprofile page', function () {
		this.timeout(30000);
		before(async function () {
			this.timeout(8000);

			Session.set('locale', 'en');
			Session.set('region', 'all');
		});

		it('should be navigable', async () => {
			const haveTitle = () => {
				assert($('h1').text().includes('s Profile'), 'Title is present');
			};

			(await MeteorAsync.subscribe('userSearch', 'Sandro')).stop(); // load user from server
			const userId = Users.findOne({ username: 'Sandro' })._id;
			Router.go('userprofile', { _id: userId, username: 'Sandro' });

			await waitForSubscriptions();
			await waitFor(haveTitle);
		});
	});
}
