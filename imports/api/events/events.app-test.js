import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';

import Events from '/imports/api/events/events';
import { MeteorAsync } from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Events', () => {
		describe('Find by filter', () => {
			it('should a gast only show events from public tenants', async () => {

			});
		});
	});
}
