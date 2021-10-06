import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('tenant create page', function () {
		this.timeout(30000);
		before(async function () {
			this.timeout(8000);
			Session.set('locale', 'en');
			Session.set('region', 'all');
		});

		it('should be navigable', async () => {
			const haveTitle = () => {
				assert($('h2').text().includes('Create your private region'), 'Title is present');
			};

			Router.go('tenantCreate');

			await waitForSubscriptions();
			await waitFor(haveTitle);
		});

	});
}
