describe('Event save', function () {
	var eventId;
	var event;

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

		event = {
			title: "Intentionally clever title for a generated test-event",
			description: "This space intentionally filled with bland verbiage. You are safe to ignore this. ",
			venue: { name: "Undisclosed place where heavy testing takes place" },
			start: theFuture,
			end: evenLater,
			region: 'testId',
			internal: true,
		};

		eventId = server.call('saveEvent', '', event);

		assert.isString(eventId, "got an event ID");
	});

	it('Allows creator to update the event', function () {
		delete event.region;
		event.title = event.title + " No really";
		server.call('saveEvent', eventId, event);
	});
});
