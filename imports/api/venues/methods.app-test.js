import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import { MeteorAsync } from '/imports/utils/promisify';
import * as VenuesMethods from '/imports/api/venues/methods';

if (Meteor.isClient) {
	describe('Venue save', () => {
		it('Stores a venue', async () => {
			// A previous test might have logged us in and we reuse that.
			// This is wrong. But we can't log-in again because
			//   "Uncaught Error: Error, too many requests. Please slow down.
			//   You must wait 10 seconds before trying again. [too-many-requests]"
			if (!Meteor.userId()) {
				await MeteorAsync.loginWithPassword('FeeLing', 'greg');
			}

			const venue = {
				name: 'Dönerbude am Ende / Anfang der Galaxis',
				description: 'Schön, dass sie uns besuchen, bevor Alles zuende ist.',
				region: '9JyFCoKWkxnf8LWPh', // Testistan
			};

			const venueId = await VenuesMethods.save('', venue);
			assert.isString(venueId, 'got an event ID');

			// Try saving it again with a change
			venue.name += '!';
			await VenuesMethods.save(venueId, venue);
		});
	});
}
