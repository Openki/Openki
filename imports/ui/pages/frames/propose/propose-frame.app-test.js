import { assert } from 'chai';
import { jQuery } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';

import { MeteorAsync } from '/imports/utils/promisify';
import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

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
			await MeteorAsync.loginWithPasswordAsync('Seee', 'greg');

			jQuery('input[value=mentor]').click();
			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-course-edit-save').click();

			const link = await waitFor(() => {
				const alertLink = jQuery('.alert a');
				assert(
					alertLink.text().includes(randomTitle),
					'A message that the course was created is shown',
				);
				return alertLink.attr('href');
			});

			// The link opens in a new window so we can't just click()
			Router.go(link);

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

			const link = await waitFor(() => {
				const alertLink = jQuery('.alert a');
				assert(
					alertLink.text().includes(randomTitle),
					'A message that the course was created is shown',
				);
				return alertLink.attr('href');
			});

			// The link opens in a new window so we can't just click()
			Router.go(link);

			await waitFor(() => {
				assert(
					jQuery('.group-cc89c5e476').length > 0 && jQuery('.group-573edec5d6').length > 0,
					'Multiple groups added in the created course',
				);
			});
		});

		it('allows to set creators role via url', async () => {
			Router.go('/frame/propose?setCreatorsRoles=mentor');

			await waitForSubscriptions();
			await waitFor(haveEditfield);
			await MeteorAsync.loginWithPasswordAsync('Seee', 'greg');

			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-course-edit-save').click();

			const link = await waitFor(() => {
				const alertLink = jQuery('.alert a');
				assert(
					alertLink.text().includes(randomTitle),
					'A message that the course was created is shown',
				);
				return alertLink.attr('href');
			});

			// The link opens in a new window so we can't just click()
			Router.go(link);

			await waitFor(() => {
				assert(
					jQuery('.course-role-enrolled button[name=mentor]').length >= 0,
					'Listed as mentor in the created course',
				);
			});
		});

		it('should allow to hide categories via url', async () => {
			Router.go('/frame/propose');

			await waitForSubscriptions();
			await waitFor(haveEditfield);

			assert(
				jQuery('.js-category-checkbox').length > 0,
				'Categories are usually present.',
			);

			Router.go('/frame/propose?hideCategories=1');

			await waitForSubscriptions();
			await waitFor(haveEditfield);

			assert(
				jQuery('.js-category-checkbox').length === 0,
				'Param hides categories.',
			);

			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-course-edit-save').click();

			await waitFor(() => {
				assert(
					jQuery('.alert a').text().includes(randomTitle),
					'A message that the course was created is shown',
				);
			});
		});
	});
}
