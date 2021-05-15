import { assert } from 'chai';
import { jQuery } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';

import { MeteorAsync } from '/imports/utils/promisify';
import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('Course history', function () {
		this.timeout(30000);
		const randomTitle = `COURSEHISTORY${1000 + Math.floor(Math.random() * 9000)}`;

		it('should show a entry for course create', async () => {
			const haveEditfield = () => {
				assert(jQuery('.js-title').length > 0, 'New course edit field present');
			};

			Router.go('/');

			await waitForSubscriptions();
			await waitFor(haveEditfield);
			await MeteorAsync.loginWithPasswordAsync('Seee', 'greg');

			// Create the course
			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-course-edit-save').click();

			// We should be redirected to the created course

			await waitFor(() => {
				assert(
					jQuery('.course-details').length > 0,
					`Details of the new course ${randomTitle} are shown`,
				);
			});

			const lastNumberOfHistoryEntries = 0;
			await waitFor(() => {
				assert.isAbove(
					jQuery('.coursehistory-event').length,
					lastNumberOfHistoryEntries,
					'A history entry should be presend for course created.',
				);
			});
		});

		// Bases on the previous test
		it('should show a entry for user subscribe', async () => {
			await MeteorAsync.logoutAsync();

			await MeteorAsync.loginWithPasswordAsync('Flumsi', 'greg');

			await waitFor(() => {
				assert(jQuery('.loginButton').text().includes('Flumsi'), 'User Flumsi sould be logged in.');
			});

			const lastNumberOfHistoryEntries = jQuery('.coursehistory-event').length;

			// Subscribe as user "Flumsi" to course
			jQuery('.js-role-enroll-btn:first').click();
			await waitForSubscriptions();
			jQuery('.js-role-subscribe-btn:first').click();

			await waitFor(() => {
				assert.isAbove(
					jQuery('.coursehistory-event').length,
					lastNumberOfHistoryEntries,
					'A history entry should be presend for user subscribe.',
				);
			});
		});
	});
}
