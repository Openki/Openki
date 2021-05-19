import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import moment from 'moment';

import { Events } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { MeteorAsync } from '/imports/utils/promisify';
import { Courses } from '../courses/courses';

if (Meteor.isClient) {
	describe('Event', () => {
		describe('Save', () => {
			it('Stores an event', async function () {
				this.timeout(5000);

				await MeteorAsync.loginWithPassword('greg', 'greg');
				const theFuture = new Date();
				theFuture.setHours(1000);

				const evenLater = new Date();
				evenLater.setHours(1002);

				const regionId = '9JyFCoKWkxnf8LWPh'; // Testistan

				const newEvent = {
					title: 'Intentionally clever title for a generated test-event',
					description:
						'This space intentionally filled with bland verbiage. You are safe to ignore this. ',
					venue: { name: 'Undisclosed place where heavy testing takes place' },
					startLocal: moment(theFuture).format('YYYY-MM-DD[T]HH:mm'),
					endLocal: moment(evenLater).format('YYYY-MM-DD[T]HH:mm'),
					region: regionId,
					internal: true,
				};

				const eventId = await EventsMethods.save({
					eventId: '',
					changes: newEvent,
				});

				assert.isString(eventId, 'event.save returns an eventId string');

				const event = { ...newEvent };
				delete event.region;
				event.title += ' No really';
				await EventsMethods.save({ eventId, changes: event });
			});

			it('Sanitizes event strings', async function () {
				this.timeout(5000);

				/* eslint-disable-next-line no-tabs */
				const titleWithExcessiveWhitespace = ' 1  2     3	4      \n';
				const expectedTitle = '1 2 3 4';
				const textWithNonPrintables = "See what's hidden in your string… or behind﻿";
				const expectedText = "See what's hidden in your string… or behind";

				await MeteorAsync.loginWithPassword('greg', 'greg');
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

				const eventId = await EventsMethods.save({
					eventId: '',
					changes: newEvent,
				});

				const handle = await MeteorAsync.subscribe('event', eventId);
				handle.stop();

				const event = Events.findOne(eventId);

				assert.equal(event.title, expectedTitle);
				assert.equal(event.description, expectedText);
			});

			it('Updates time_lastedit from course', async function () {
				this.timeout(5000);

				await MeteorAsync.loginWithPassword('greg', 'greg');

				const courseId = 'eb6aedecf9';

				const handle = await MeteorAsync.subscribe('courseDetails', courseId);
				try {
					const oldCourse = Courses.findOne(courseId);

					const theFuture = new Date();
					theFuture.setHours(1000);

					const evenLater = new Date();
					evenLater.setHours(1002);

					const regionId = '9JyFCoKWkxnf8LWPh'; // Testistan

					const newEvent = {
						courseId,
						title: 'Intentionally clever title for a generated test-event',
						description: 'Nothing special here.',
						venue: { name: 'Undisclosed place where heavy testing takes place' },
						startLocal: moment(theFuture).format('YYYY-MM-DD[T]HH:mm'),
						endLocal: moment(evenLater).format('YYYY-MM-DD[T]HH:mm'),
						region: regionId,
						internal: true,
					};

					await EventsMethods.save({
						eventId: '',
						changes: newEvent,
					});

					const newCourse = Courses.findOne(courseId);

					assert.isAbove(newCourse.time_lastedit.getTime(), oldCourse.time_lastedit.getTime());
				} finally {
					handle.stop();
				}
			});
		});
	});
}
