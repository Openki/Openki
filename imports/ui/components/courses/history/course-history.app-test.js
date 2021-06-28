import { assert } from 'chai';
import $ from 'jquery';
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
				assert($('.js-title').length > 0, 'New course edit field present');
			};

			Router.go('/');

			await waitForSubscriptions();
			await waitFor(haveEditfield);
			await MeteorAsync.loginWithPassword('Seee', 'greg');

			// Create the course
			$('.js-title').val(randomTitle);
			$('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			$('.js-course-edit-save').trigger('click');

			// We should be redirected to the created course

			await waitFor(() => {
				assert(
					$('.course-details').length > 0,
					`Details of the new course ${randomTitle} are shown`,
				);
			});

			const lastNumberOfHistoryEntries = 0;
			await waitFor(() => {
				assert.isAbove(
					$('.coursehistory-event').length,
					lastNumberOfHistoryEntries,
					'A history entry should be presend for course created.',
				);
			});
		});

		// Bases on the previous test
		it('should show a entry for user subscribe', async () => {
			await MeteorAsync.logout();

			await MeteorAsync.loginWithPassword('Flumsi', 'greg');

			await waitFor(() => {
				assert($('.loginButton').text().includes('Flumsi'), 'User Flumsi sould be logged in.');
			});

			const lastNumberOfHistoryEntries = $('.coursehistory-event').length;

			// Subscribe as user "Flumsi" to course
			$('.js-role-enroll-btn:first').trigger('click');
			await waitForSubscriptions();
			$('.js-role-subscribe-btn:first').trigger('click');

			await waitFor(() => {
				assert.isAbove(
					$('.coursehistory-event').length,
					lastNumberOfHistoryEntries,
					'A history entry should be presend for user subscribe.',
				);
			});
		});
	});
}
