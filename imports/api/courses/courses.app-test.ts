import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';

import { Courses } from './courses';

import { PublicSettings } from '/imports/utils/PublicSettings';

if (Meteor.isClient) {
	describe('Courses', () => {
		describe('Find by filter', () => {
			before(async function () {
				this.timeout(8000);

				// A previous test might have logged us in.
				if (Meteor.userId()) {
					await MeteorAsync.logout();
				}
				Session.set('region', 'all');
			});

			it('should a gast only show courses from public tenants', async function () {
				this.timeout(6000);

				await MeteorAsync.subscribe('Courses.findFilter');

				const coursesAsGast = Courses.findFilter().fetch();

				assert.isNotEmpty(coursesAsGast, 'shows courses');

				assert.isEmpty(
					coursesAsGast.filter(
						(c) => c.tenant && !PublicSettings.publicTenants.includes(c.tenant),
					),
					"don't show courses from not public",
				);
			});

			it('should allow a logged in user to see courses from his tenant', async function () {
				this.timeout(6000);

				await MeteorAsync.subscribe('Courses.findFilter');

				const coursesAsGast = Courses.findFilter().fetch();

				await MeteorAsync.loginWithPassword('Schufien', 'greg');
				const schufien = Meteor.user();

				assert.ok(schufien);

				const coursesAsSchufien = Courses.findFilter().fetch();

				assert.includeMembers(
					coursesAsSchufien.map((c) => c._id),
					coursesAsGast.map((c) => c._id),
					'shows public courses as logged in user',
				);

				assert.isTrue(
					coursesAsSchufien.length > coursesAsGast.length,
					'shows private courses as logged in user',
				);
				assert.isNotEmpty(
					coursesAsSchufien.filter(
						(c) => c.tenant && schufien.tenants.some((t) => t._id === c.tenant),
					),
					'shows private courses as logged in user',
				);
			});

			it('should allow to be called with empty params', async function () {
				this.timeout(6000);

				await MeteorAsync.subscribe('Courses.findFilter', {}, undefined, undefined, []);

				Courses.findFilter({}, undefined, undefined, []).fetch();
			});
		});
	});
}
