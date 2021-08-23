import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Course details', () => {
		describe('Archive course', function () {
			this.timeout(30000);

			it('should allow to archive a course internal', async () => {
				const randomTitle = `ARCHIVED${1000 + Math.floor(Math.random() * 9000)}`;

				Router.go('/');
				const haveEditfield = () => {
					assert($('.js-title').length > 0, 'New course edit field present');
				};
				await MeteorAsync.loginWithPassword('greg', 'greg');
				await waitForSubscriptions();
				await waitFor(haveEditfield);

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

				$('.js-course-archive').trigger('click');

				Router.go('/');

				await waitFor(() => {
					assert(
						!$('body').text().includes(randomTitle),
						`The archived course should not be visible on the start page ${window.location}`,
					);
				}, 5000);

				Router.go('/?archived=1');

				await waitFor(() => {
					assert(
						!$('body').text().includes(randomTitle),
						`The archived course should be visible on the start page ${window.location} with archived filter on`,
					);
				}, 5000);
			});
		});
	});
}
