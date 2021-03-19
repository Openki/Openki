import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'chai';
import { jQuery } from 'meteor/jquery';

import {
	login, logout, waitForSubscriptions, waitFor,
} from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('Create course in group', function () {
		this.timeout(30000);
		const randomTitle = `TEST${1000 + Math.floor(Math.random() * 9000)}`;
		it('saves course for group', () => {
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
			return waitForSubscriptions()
				.then(waitFor(haveEditfield))
				.then(waitFor(findExpectedFormTitle))
				.then(login('Seee', 'greg'))
				.then(() => {
				// Create the course
					jQuery('.js-title').val(randomTitle);
					jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
					jQuery('.js-course-edit-save').click();

				// We should be redirected to the created course
				})
				.then(waitFor(() => {
					assert(
						jQuery('.course-details').length > 0,
						`Details of the new course ${randomTitle} are shown`,
					);
				}))
				.then(waitFor(() => {
					assert.match(
						jQuery('.js-group-label').text(), /SKG/,
						'The course is in the group it was created in',
					);
				}))
				// Members of the group the course was created in must be able to
				// edit the course.
				// See ticket #1331 group members can not edit all courses despite their
				// group being in the orga-team.
				// So we login as a member of "SKG" then check whether the edit button shows up.
				.then(logout())
				.then(login('Normalo', 'greg'))
				.then(waitFor(() => {
					assert(
						jQuery('.js-course-edit').length > 0,
						'User from group can edit course',
					);
				}));
		});
	});

	describe('Create internal course in group', function () {
		this.timeout(30000);
		const randomTitle = `INTERNAL${1000 + Math.floor(Math.random() * 9000)}`;
		it('saves course for group as internal', () => {
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
			return waitForSubscriptions()
				.then(waitFor(haveEditfield))
				.then(waitFor(findExpectedFormTitle))
				.then(waitFor(haveNotInternalCheckbox))
				.then(login('greg', 'greg'))
				.then(waitFor(haveInternalCheckbox))
				.then(() => {
				// Create the course
					jQuery('.js-title').val(randomTitle);
					jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
					jQuery('.js-check-internal').prop('checked', true);
					jQuery('.js-course-edit-save').click();

				// We should be redirected to the created course
				})
				.then(waitFor(() => {
					assert(
						jQuery('.course-details').length > 0,
						`Details of the new course ${randomTitle} are shown`,
					);
				}))
				.then(waitFor(() => {
					assert.match(
						jQuery('.js-group-label').text(), /ASZ/,
						'The course is in the group it was created in',
					);
					Router.go('/');
				}))
				.then(waitFor(() => {
					assert(
						jQuery('body').text().indexOf(randomTitle) === -1,
						`The internal course should not be visible on the start page ${window.location}`,
					);
				}, 5000));
		});
	});
}
