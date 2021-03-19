import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'chai';
import { jQuery } from 'meteor/jquery';

import { login, waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('Propose course via frame', function () {
		this.timeout(30000);
		const randomTitle = `PROPOSE${1000 + Math.floor(Math.random() * 9000)}`;

		const haveEditfield = () => {
			assert(
				jQuery('.js-title').length > 0,
				'New course edit field present',
			);
		};

		it('allows to select mentor role', async () => {
			Router.go('/frame/propose');

			await waitForSubscriptions();
			await waitFor(haveEditfield);
			await login('Seee', 'greg');

			jQuery('input[value=mentor]').click();
			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-course-edit-save').click();
			await waitFor(() => {
				const alertLink = jQuery('.alert a');
				assert(
					alertLink.text().indexOf(randomTitle) >= 0,
					'A message that the course was created is shown',
				);
				// The link opens in a new window so we can't just click()
				Router.go(alertLink.attr('href'));
			});
			await waitFor(() => {
				assert(
					jQuery('.course-role-enrolled button[name=mentor]').length >= 0,
					'Listed as mentor in the created course',
				);
			});
		});

		it('allows to add multiple groups', async () => {
			Router.go('/frame/propose?addTeamGroups=cc89c5e476,573edec5d6');


			await waitForSubscriptions();
			await waitFor(haveEditfield);

			jQuery('input[value=mentor]').click();
			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-course-edit-save').click();

			await waitFor(() => {
				const alertLink = jQuery('.alert a');
				assert(
					alertLink.text().indexOf(randomTitle) >= 0,
					'A message that the course was created is shown',
				);
				// The link opens in a new window so we can't just click()
				Router.go(alertLink.attr('href'));
			});

			await waitFor(() => {
				assert(
					jQuery('.group-cc89c5e476').length > 0 && jQuery('.group-573edec5d6').length > 0,
					'Multiple groups added in the created course',
				);
			});
		});
	});
}
