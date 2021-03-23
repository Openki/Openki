import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';

import Events from '/imports/api/events/events';
import MeteorAsync from '/imports/utils/promisify';

if (Meteor.isClient) {
	describe('Event', () => {
		describe('Save', () => {
			it('Stores an event', async function () {
				this.timeout(5000);

				await MeteorAsync.loginWithPasswordAsync('greg', 'greg');
				const theFuture = new Date();
				theFuture.setHours(1000);

				const evenLater = new Date();
				evenLater.setHours(1002);

				const regionId = '9JyFCoKWkxnf8LWPh'; // Testistan

				const newEvent = {
					title: 'Intentionally clever title for a generated test-event',
					description: 'This space intentionally filled with bland verbiage. You are safe to ignore this. ',
					venue: { name: 'Undisclosed place where heavy testing takes place' },
					startLocal: moment(theFuture).format('YYYY-MM-DD[T]HH:mm'),
					endLocal: moment(evenLater).format('YYYY-MM-DD[T]HH:mm'),
					region: regionId,
					internal: true,
				};

				const eventId = await MeteorAsync.callAsync('event.save', { eventId: '', changes: newEvent });

				assert.isString(eventId, 'event.save returns an eventId string');

				const event = { ...newEvent };
				delete event.region;
				event.title += ' No really';
				await MeteorAsync.callAsync('event.save', { eventId, changes: event });
			});

			it('Sanitizes event strings', async function () {
				this.timeout(5000);

				/* eslint-disable-next-line no-tabs */
				const titleWithExcessiveWhitespace = ' 1  2     3	4      \n';
				const expectedTitle = '1 2 3 4';
				const textWithNonPrintables = "See what's hidden in your string… or behind﻿";
				const expectedText = "See what's hidden in your string… or behind";

				await MeteorAsync.loginWithPasswordAsync('greg', 'greg');
				const theFuture = new Date();
				theFuture.setHours(1000);

				const evenLater = new Date();
				evenLater.setHours(1002);

				const regionId = '9JyFCoKWkxnf8LWPh'; // Testistan

				const newEvent = {
					title: titleWithExcessiveWhitespace,
					description: textWithNonPrintables,
					venue: { name: 'Undisclosed place where heavy testing takes place' },
					startLocal: moment(theFuture).format('YYYY-MM-DD[T]HH:mm'),
					endLocal: moment(evenLater).format('YYYY-MM-DD[T]HH:mm'),
					region: regionId,
				};

				const eventId = await MeteorAsync.callAsync('event.save', { eventId: '', changes: newEvent });

				const handle = await MeteorAsync.subscribeAsync('event', eventId);
				handle.stop();

				const event = Events.findOne(eventId);

				assert.equal(event.title, expectedTitle);
				assert.equal(event.description, expectedText);
			});
		});
	});
}
