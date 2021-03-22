import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'chai';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Frontpage', function () {
		this.timeout(60000);
		beforeEach(async () => {
			await MeteorAsync.callAsync('fixtures.clean');
		});
		beforeEach(async () => {
			await MeteorAsync.callAsync('fixtures.create');
		});
		it('should list 8 courses for unauthenticated user (Testistan)', async () => {
			Router.go('/');
			Session.set('region', '9JyFCoKWkxnf8LWPh'); // Testistan

			await waitForSubscriptions();
			const titles = await waitFor(() => {
				// eslint-disable-next-line no-shadow
				const titles = document.getElementsByClassName('course-compact-title');
				assert.equal(titles.length, 8, 'expect to see test course titles');
				return titles;
			}, 6000);
			await waitFor(() => {
				assert.equal(titles[0].textContent, 'Sprachaustausch');
				assert.equal(titles[1].textContent, 'Game Design mit Unity');
				assert.equal(titles[2].textContent, 'Aikido');
				assert.equal(titles[3].textContent, 'Open Lab');
				assert.equal(titles[4].textContent, 'First-Aid Course');
				assert.equal(titles[5].textContent, 'Ubuntu auf Mac (dual-Boot)');
				assert.equal(titles[6].textContent, 'Velo Flicken');
				assert.equal(titles[7].textContent, 'Meteor.js Workshop');
			});
		});
	});
}
