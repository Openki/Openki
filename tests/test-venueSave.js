describe('Venue save', function() {
	var venueId;
	var venue;

	it('Stores a venue', function() {
		/* Instead of logging in ourselves we rely on the previous test having
		 * logged us in. That is wrong. But we can't log-in again because
		 *   "Uncaught Error: Error, too many requests. Please slow down. You must wait 10 seconds before trying again. [too-many-requests]"
		 * hopefully when we switch to the official meteor testing ways this
		 * limitation goes away.
		server.call('login', {
			"user": {
				"username": "FeeLing"
			},
			"password": {
				"digest": "0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
				"algorithm": "sha-256"
			}
		});
		*/
		venue = {
			name: "Dönerbude am Ende der Galaxis",
			description: "Schön, dass sie uns besuchen, bevor Alles zuende ist.",
			region: '9JyFCoKWkxnf8LWPh', // Testistan
		};

		venueId = server.call('venue.save', '', venue);

		assert.isString(venueId, "got an event ID");
	});

	it('Allows creator to update the venue', function() {
		venue.name = venue.name + "!";
		server.call('venue.save', venueId, venue);
	});
});
