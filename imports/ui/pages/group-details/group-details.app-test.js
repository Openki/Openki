import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import { jQuery } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Create course in group', function () {
		this.timeout(30000);
		const randomTitle = `TEST${1000 + Math.floor(Math.random() * 9000)}`;
		it('saves course for group', async () => {
			Router.go('/group/fd3a8d98d4');
			const haveEditfield = () => {
				assert(
					jQuery('.js-title').length > 0,
					'New course edit field present',
				);
			};
			const findExpectedFormTitle = () => {
				// assert group name is mentioned in course creation form title
				const expectedTitle = /Kommunikationsguerilla/;
				const actualTitle = jQuery('form h2').text();
				assert.match(
					actualTitle, expectedTitle,
					'Form title must mention group',
				);
			};

			await waitForSubscriptions();
			await waitFor(haveEditfield);
			await waitFor(findExpectedFormTitle);
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

			await waitFor(() => {
				assert.match(
					jQuery('.js-group-label').text(), /SKG/,
					'The course is in the group it was created in',
				);
			});
			// Members of the group the course was created in must be able to
			// edit the course.
			// See ticket #1331 group members can not edit all courses despite their
			// group being in the orga-team.
			// So we login as a member of "SKG" then check whether the edit button shows up.
			await MeteorAsync.logoutAsync();
			await MeteorAsync.loginWithPasswordAsync('Normalo', 'greg');
			await waitFor(() => {
				assert(
					jQuery('.js-course-edit').length > 0,
					'User from group can edit course',
				);
			});
		});
	});

	describe('Create internal course in group', function () {
		this.timeout(30000);
		const randomTitle = `INTERNAL${1000 + Math.floor(Math.random() * 9000)}`;
		it('saves course for group as internal', async () => {
			Router.go('/group/b0f1a82d36');
			const haveEditfield = () => {
				assert(
					jQuery('.js-title').length > 0,
					'New course edit field present',
				);
			};
			const findExpectedFormTitle = () => {
				// assert group name is mentioned in course creation form title
				const expectedTitle = /Autonome Schule Zürich/;
				const actualTitle = jQuery('form h2').text();
				assert.match(
					actualTitle, expectedTitle,
					'Form title must mention group',
				);
			};
			const haveNotInternalCheckbox = () => {
				assert(
					jQuery('.js-check-internal').length === 0,
					'Internal checkbox is not present',
				);
			};
			const haveInternalCheckbox = () => {
				assert(
					jQuery('.js-check-internal').length > 0,
					'Internal checkbox present',
				);
			};
			await waitForSubscriptions();
			await waitFor(haveEditfield);
			await waitFor(findExpectedFormTitle);
			await waitFor(haveNotInternalCheckbox);
			await MeteorAsync.loginWithPasswordAsync('greg', 'greg');
			await waitFor(haveInternalCheckbox);

			// Create the course
			jQuery('.js-title').val(randomTitle);
			jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
			jQuery('.js-check-internal').prop('checked', true);
			jQuery('.js-course-edit-save').click();

			// We should be redirected to the created course

			await waitFor(() => {
				assert(
					jQuery('.course-details').length > 0,
					`Details of the new course ${randomTitle} are shown`,
				);
			});

			await waitFor(() => {
				assert.match(
					jQuery('.js-group-label').text(), /ASZ/,
					'The course is in the group it was created in',
				);
				Router.go('/');
			});

			await waitFor(() => {
				assert(
					jQuery('body').text().indexOf(randomTitle) === -1,
					`The internal course should not be visible on the start page ${window.location}`,
				);
			}, 5000);
		});
	});
}
