describe('Event save', function () {
	it('Stores an event', function () {
		server.call('login', {
			"user": {
				"username": "greg"
			},
			"password": {
				"digest": "0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
				"algorithm": "sha-256"
			}
		});

		var theFuture = new Date();
		theFuture.setHours(1000);

		var evenLater = new Date();
		evenLater.setHours(1002);

		var eventId = server.call('saveEvent', '', {
			title: "Intentionally clever title for a generated test-event",
			description: "This space intentionally filled with bland verbiage. You are safe to ignore this. ",
			location: { name: "Undisclosed place where heavy testing takes place" },
			start: theFuture,
			end: evenLater,
			region: 'testId',
			internal: true,
		});

		assert.isString(eventId, "got an event ID");

		// Ok once I figure out a good way to subscribe we can even test whether the event was stored >_<
  });
});
