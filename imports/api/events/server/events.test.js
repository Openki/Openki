/*jshint -W100*/ // JSHint doesn't like the BOM in textWithNonPrintables

import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';

function promiseMeteorCall(...args) {
	return new Promise((resolve, reject) => {
		Meteor.call(...args, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
}

if (Meteor.isClient) {
	describe('Event save', function() {
		it('Stores an event', function(done) {
			new Promise((resolve, reject) => {
				Meteor.loginWithPassword("greg", "greg", (err) => {
					if (err) reject(err);
					else resolve();
				});
			}).then(() => {
				const theFuture = new Date();
				theFuture.setHours(1000);

				const evenLater = new Date();
				evenLater.setHours(1002);

				const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

				return {
					title: "Intentionally clever title for a generated test-event",
					description: "This space intentionally filled with bland verbiage. You are safe to ignore this. ",
					venue: { name: "Undisclosed place where heavy testing takes place" },
					startLocal: moment(theFuture).format("YYYY-MM-DD[T]HH:mm"),
					endLocal:   moment(evenLater).format("YYYY-MM-DD[T]HH:mm"),
					region: regionId,
					internal: true,
				};
			}).then((event) => {
				return promiseMeteorCall('event.save', { eventId: '', changes: event }).then(
					(eventId) => ({ event, eventId })
				);
			}).then(({ event, eventId }) => {
				assert.isString(eventId, "event.save returns an eventId string");
				return { event, eventId };
			}).then(({ event, eventId }) => {
				delete event.region;
				event.title = event.title + " No really";
				return promiseMeteorCall('event.save', { eventId, changes: event });
			}).then(() => done(), done);
		});
		it('Sanitizes event strings', function() {
			const titleWithExcessiveWhitespace = " 1  2     3	4      \n";
			const expectedTitle = "1 2 3 4";
			const textWithNonPrintables = "See what's hidden in your string… or be​hind﻿";
			const expectedText = "See what's hidden in your string… or behind";

			return new Promise((resolve, reject) => {
				Meteor.loginWithPassword("greg", "greg", (err) => {
					if (err) reject(err);
					else resolve();
				});
			}).then(() => {
				const theFuture = new Date();
				theFuture.setHours(1000);

				const evenLater = new Date();
				evenLater.setHours(1002);

				const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

				const event = {
					title: titleWithExcessiveWhitespace,
					description: textWithNonPrintables,
					venue: { name: "Undisclosed place where heavy testing takes place" },
					startLocal: moment(theFuture).format("YYYY-MM-DD[T]HH:mm"),
					endLocal:   moment(evenLater).format("YYYY-MM-DD[T]HH:mm"),
					region: regionId,
				};

				return promiseMeteorCall('saveEvent', { eventId: '', changes: event });
			}).then(eventId => {
				return new Promise((resolve, reject) => {
					Meteor.subscribe('event', eventId, () => {
						resolve(Events.findOne(eventId));
					});
				});
			}).then(event => {
				assert.equal(event.title, expectedTitle);
				assert.equal(event.description, expectedText);
			});
		});
	});
}
