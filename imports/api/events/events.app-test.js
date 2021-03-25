import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from '/imports/utils/promisify';

import Events from './events';

if (Meteor.isClient) {
	describe('Events', () => {
		describe('Find by filter', () => {
			before(async function () {
				this.timeout(8000);

				// A previous test might have logged us in.
				if (Meteor.userId()) {
					await MeteorAsync.logoutAsync();
				}
				Session.set('region', 'all');

				await MeteorAsync.subscribeAsync('Events.findFilter');
			});

			it('should a gast only show events from public tenants', async function () {
				this.timeout(6000);

				const eventsAsGast = Events.findFilter().fetch();

				assert.isNotEmpty(eventsAsGast, 'shows events');

				assert.isEmpty(eventsAsGast.filter((c) => c.tenant && !Meteor.settings.public.publicTenants.includes(c.tenant)), "don't show events from not public");
			});

			it('should allow a logged in user to see events from his tenant', async function () {
				this.timeout(6000);

				const eventsAsGast = Events.findFilter().fetch();

				await MeteorAsync.loginWithPasswordAsync('Schufien', 'greg');
				const schufien = Meteor.user();

				assert.ok(schufien);

				const eventsAsSchufien = Events.findFilter().fetch();

				assert.includeMembers(eventsAsSchufien.map((c) => c._id), eventsAsGast.map((c) => c._id), 'shows public events as logged in user');

				assert.isTrue(eventsAsSchufien.length > eventsAsGast.length, 'shows private events as logged in user');
				assert.isNotEmpty(eventsAsSchufien.filter((c) => c.tenant && schufien.tenants.includes(c.tenant)), 'shows private events as logged in user');
			});
		});
	});
}
