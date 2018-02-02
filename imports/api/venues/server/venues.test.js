import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

if (Meteor.isClient) {
	describe('Venue save', function() {
		it('Stores a venue', function(done) {
			const testCreate = () => {
				const venue = {
					name: "Dönerbude am Ende der Galaxis",
					description: "Schön, dass sie uns besuchen, bevor Alles zuende ist.",
					region: '9JyFCoKWkxnf8LWPh', // Testistan
				};

				Meteor.call('venue.save', '', venue, (err, createdId) => {
					if (err) return done(err);
					const venueId = createdId;
					assert.isString(venueId, "got an event ID");

					// Try saving it again with a change
					venue.name = venue.name + "!";
					Meteor.call('venue.save', venueId, venue, (err) => {
						done(err);
					});
				});
			};

			// A previous test might have logged us in and we reuse that.
			// This is wrong. But we can't log-in again because
			//   "Uncaught Error: Error, too many requests. Please slow down. You must wait 10 seconds before trying again. [too-many-requests]"
			if (Meteor.userId()) {
				testCreate();
			} else {
				Meteor.loginWithPassword("FeeLing", "greg", (err) => {
					if (err) return done(err);
					testCreate();
				});
			}
		});
	});
}
