import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { assert } from 'chai';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Frontpage', function () {
		before(async function () {
			this.timeout(60000);
			// A previous test might have logged us in.
			if (Meteor.userId()) {
				await MeteorAsync.logout();
			}
		});
		beforeEach(async () => {
			await MeteorAsync.call('fixtures.clean');
		});
		beforeEach(async () => {
			await MeteorAsync.call('fixtures.create');
		});
		it('should list 5 courses for unauthenticated user (Testistan)', async () => {
			Router.go('/');
			Session.set('region', '9JyFCoKWkxnf8LWPh'); // Testistan

			await waitForSubscriptions();
			const titles = await waitFor(() => {
				const t = document.getElementsByClassName('course-compact-title');
				assert.equal(t.length, 5, 'expect to see test course titles');
				return t;
			}, 6000);
			await waitFor(() => {
				assert.equal(titles[0].textContent, 'Aikido');
				assert.equal(titles[1].textContent, 'German workshop');
				assert.equal(titles[2].textContent, 'Ubuntu auf Mac (dual-Boot)');
				assert.equal(titles[3].textContent, 'Deutsch');
				assert.equal(titles[4].textContent, 'Lesegruppe');
			});
		});
	});
}
