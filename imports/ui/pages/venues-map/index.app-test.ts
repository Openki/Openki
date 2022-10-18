import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

import * as LocalRegionStore from '/imports/ui/lib/LocalRegionStore';

if (Meteor.isClient) {
	describe('Venues map', function () {
		this.timeout(30000);
		before(async function () {
			this.timeout(8000);

			await MeteorAsync.loginWithPassword('greg', 'greg');
			Session.set('locale', 'en');
			LocalRegionStore.reset();
		});

		it('should be navigable', async () => {
			const haveTitle = () => {
				assert($('h1').text().includes('Venues'), 'Title is present');
			};

			Router.go('venuesMap');
			await waitForSubscriptions();
			await waitFor(haveTitle);
		});
	});
}
