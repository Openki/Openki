import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { assert } from 'chai';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Frontpage', function () {
		this.timeout(60000);
		beforeEach(async () => {
			await MeteorAsync.call('fixtures.clean');
		});
		beforeEach(async () => {
			await MeteorAsync.call('fixtures.create');
		});
		it('should list 7 courses for unauthenticated user (Testistan)', async () => {
			Router.go('/');
			Session.set('region', '9JyFCoKWkxnf8LWPh'); // Testistan

			await waitForSubscriptions();
			const titles = await waitFor(() => {
				const t = document.getElementsByClassName('course-compact-title');
				assert.equal(t.length, 7, 'expect to see test course titles');
				return t;
			}, 6000);
			await waitFor(() => {
				assert.equal(titles[0].textContent, 'Sprachaustausch');
				assert.equal(titles[1].textContent, 'Game Design mit Unity');
				assert.equal(titles[2].textContent, 'Aikido');
				assert.equal(titles[3].textContent, 'Open Lab');
				assert.equal(titles[4].textContent, 'Ubuntu auf Mac (dual-Boot)');
				assert.equal(titles[5].textContent, 'Velo Flicken');
				assert.equal(titles[6].textContent, 'Meteor.js Workshop');
			});
		});
	});
}
