import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'chai';
import { jQuery } from 'meteor/jquery';

import { subscriptionsReady, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('Propose course via frame', function () {
		this.timeout(30000);
		const randomTitle = `PROPOSE${1000 + Math.floor(Math.random() * 9000)}`;
		it('allows to select mentor role', () => {
			Router.go('/frame/propose');

			const haveEditfield = () => {
				assert(
					jQuery('.js-title').length > 0,
					'New course edit field present',
				);
			};

			return subscriptionsReady()
				.then(waitFor(haveEditfield))
				.then(() => new Promise((done, reject) => {
					Meteor.loginWithPassword('Seee', 'greg', (err) => {
						if (err) {
							reject(err);
						} else {
							done();
						}
					});
				}))
				.then(() => {
					jQuery('input[value=mentor]').click();
					jQuery('.js-title').val(randomTitle);
					jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
					jQuery('.js-course-edit-save').click();
				})
				.then(waitFor(() => {
					const alertLink = jQuery('.alert a');
					assert(
						alertLink.text().indexOf(randomTitle) >= 0,
						'A message that the course was created is shown',
					);
					// The link opens in a new window so we can't just click()
					Router.go(alertLink.attr('href'));
				}))
				.then(waitFor(() => {
					assert(
						jQuery('.course-role-enrolled').text().indexOf('mentor') >= 0,
						'Listed as mentor in the created course',
					);
				}));
		});
	});

	describe('Propose course via frame', function () {
		this.timeout(30000);
		const randomTitle = `PROPOSE${1000 + Math.floor(Math.random() * 9000)}`;
		it('allows to add multiple groups', () => {
			Router.go('/frame/propose?addTeamGroups=cc89c5e476,573edec5d6');

			const haveEditfield = () => {
				assert(
					jQuery('.js-title').length > 0,
					'New course edit field present',
				);
			};

			return subscriptionsReady()
				.then(waitFor(haveEditfield))
				.then(() => {
					jQuery('input[value=mentor]').click();
					jQuery('.js-title').val(randomTitle);
					jQuery('.js-select-region').val('9JyFCoKWkxnf8LWPh'); // Testistan
					jQuery('.js-course-edit-save').click();
				})
				.then(waitFor(() => {
					const alertLink = jQuery('.alert a');
					assert(
						alertLink.text().indexOf(randomTitle) >= 0,
						'A message that the course was created is shown',
					);
					// The link opens in a new window so we can't just click()
					Router.go(alertLink.attr('href'));
				}))
				.then(waitFor(() => {
					assert(
						jQuery('.group-cc89c5e476').length > 0 && jQuery('.group-573edec5d6').length > 0,
						'Multiple groups added in the created course',
					);
				}));
		});
	});
}
