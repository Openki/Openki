import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

if (Meteor.isClient) {
	describe('Event save', function() {
		let eventId;
		let event;

		it('Stores an event', function(done) {
			Meteor.call('login', {
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

			var regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

			event = {
				title: "Intentionally clever title for a generated test-event",
				description: "This space intentionally filled with bland verbiage. You are safe to ignore this. ",
				venue: { name: "Undisclosed place where heavy testing takes place" },
				startLocal: moment(theFuture).format("YYYY-MM-DD[T]HH:mm"),
				endLocal:   moment(evenLater).format("YYYY-MM-DD[T]HH:mm"),
				region: regionId,
				internal: true,
			};

			Meteor.call('saveEvent', '', event, (err, newId) => {
				if (err) return done(err);
				eventId = newId;
				assert.isString(eventId, "saveEvent returns an eventId string");
				done();
			});
		});

		it('Allows creator to update the event', function(done) {
			if (!eventId) return done();
			if (eventId) {
				delete event.region;
				event.title = event.title + " No really";
				Meteor.call('saveEvent', eventId, event, (err) => {
					if (err) done(err);
					else done();
				});
			}
		});
	});
}
