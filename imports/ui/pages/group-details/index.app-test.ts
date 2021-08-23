import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Group details', () => {
		describe('Create', function () {
			this.timeout(30000);

			const haveEditfield = () => {
				assert(
					$('.group-details-name [contenteditable=true]').length > 0,
					'Group name edit field present',
				);
			};

			it('should throw a error on create a group with only a name', async () => {
				const randomTitle = `CREATE${1000 + Math.floor(Math.random() * 9000)}`;

				Router.go('/group/create');

				await MeteorAsync.loginWithPassword('Seee', 'greg');

				await waitForSubscriptions();
				await waitFor(haveEditfield);

				$('.group-details-name [contenteditable=true]').html(randomTitle);
				$('.js-group-save').trigger('click');

				await waitFor(() => {
					assert($('.has-error').length > 0, 'A message error message is shown');
				});
			});

			it('should allow to create a group with name, short, claim and description', async () => {
				const randomTitle = `CREATE${1000 + Math.floor(Math.random() * 9000)}`;

				Router.go('/group/create');

				await MeteorAsync.loginWithPassword('Seee', 'greg');

				await waitForSubscriptions();
				await waitFor(haveEditfield);

				$('.group-details-name [contenteditable=true]').html(randomTitle);
				$('.group-details-short [contenteditable=true]').html(`${randomTitle} short`);
				$('.group-details-claim [contenteditable=true]').html(`${randomTitle} claim`);
				$('.group-details-description [contenteditable=true]').html(`${randomTitle} description`);
				$('.js-group-save').trigger('click');

				await waitFor(() => {
					assert(
						$('.alert.alert-success').text().includes(randomTitle),
						'A message that the course was created is shown',
					);
					assert($('.group-details-name').text().includes(randomTitle), 'The title is visible');
				});
			});
		});

		describe('Edit course', function () {
			this.timeout(30000);
			it('should allow to save a course in the group', async () => {
				const randomTitle = `TEST${1000 + Math.floor(Math.random() * 9000)}`;

				Router.go('/group/fd3a8d98d4');
				const haveEditfield = () => {
					assert($('.js-title').length > 0, 'New course edit field present');
				};
				const findExpectedFormTitle = () => {
					// assert group name is mentioned in course creation form title
					const expectedTitle = /Kommunikationsguerilla/;
					const actualTitle = $('form h2').text();
					assert.match(actualTitle, expectedTitle, 'Form title must mention group');
				};

				await waitForSubscriptions();
				await waitFor(haveEditfield);
				await waitFor(findExpectedFormTitle);
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
					assert.match(
						$('.js-group-label').text(),
						/SKG/,
						'The course is in the group it was created in',
					);
				});

				// Members of the group the course was created in must be able to
				// edit the course.
				// See ticket #1331 group members can not edit all courses despite their
				// group being in the orga-team.
				// So we login as a member of "SKG" then check whether the edit button shows up.
				await MeteorAsync.logout();
				await MeteorAsync.loginWithPassword('Normalo', 'greg');
				await waitFor(() => {
					assert($('.js-course-edit').length > 0, 'User from group can edit course');
				});
			});

			it('should allow to save a course internal in the group', async () => {
				const randomTitle = `INTERNAL${1000 + Math.floor(Math.random() * 9000)}`;

				Router.go('/group/b0f1a82d36');
				const haveEditfield = () => {
					assert($('.js-title').length > 0, 'New course edit field present');
				};
				const findExpectedFormTitle = () => {
					// assert group name is mentioned in course creation form title
					const expectedTitle = /Autonome Schule Zürich/;
					const actualTitle = $('form h2').text();
					assert.match(actualTitle, expectedTitle, 'Form title must mention group');
				};
				const haveNotInternalCheckbox = () => {
					assert($('.js-check-internal').length === 0, 'Internal checkbox is not present');
				};
				const haveInternalCheckbox = () => {
					assert($('.js-check-internal').length > 0, 'Internal checkbox present');
				};
				await waitForSubscriptions();
				await waitFor(haveEditfield);
				await waitFor(findExpectedFormTitle);
				await waitFor(haveNotInternalCheckbox); // on creation the internal checkbox should not be present for none group members
				await MeteorAsync.loginWithPassword('greg', 'greg');
				await waitFor(haveInternalCheckbox);

				// Create the course
				$('.js-title').val(randomTitle);
				$('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
				$('.js-check-internal').prop('checked', true);
				$('.js-course-edit-save').trigger('click');

				// We should be redirected to the created course

				await waitFor(() => {
					assert(
						$('.course-details').length > 0,
						`Details of the new course ${randomTitle} are shown`,
					);
					assert.match(
						$('.js-group-label').text(),
						/ASZ/,
						'The course is in the group it was created in',
					);
				});

				Router.go('/');

				await waitFor(() => {
					assert(
						!$('body').text().includes(randomTitle),
						`The internal course should not be visible on the start page ${window.location}`,
					);
				}, 5000);
			});
		});
	});
}
