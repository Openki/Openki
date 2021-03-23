import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { assert } from 'chai';
import AssertionError from 'assertion-error';

import '/imports/api/fixtures/methods';

// Checks response status and content-type
const assertGoodHeaders = function (result) {
	assert.equal(result.status, 200);
	assert.equal(result.headers.get('Content-Type'), 'application/json; charset=utf-8');
};

// Construct a function that fails if it's ever called with a lesser value than the one before
const AssertAscending = function (base, message) {
	let current = base;
	return function (next) {
		assert.isAtLeast(next, current, message);
		current = next;
	};
};

const AssertDescending = function (base, message) {
	let current = base;
	return function (next) {
		assert.isAtMost(next, current, message);
		current = next;
	};
};

const AssertAscendingString = function (base, message) {
	let current = base.toLowerCase();
	return function (next) {
		const lowerNext = next.toLowerCase();
		const side = current.localeCompare(lowerNext);
		if (side > 0) {
			throw new AssertionError(`${message}. But the string '${current}' orders after '${lowerNext}'`);
		}
		current = lowerNext;
	};
};

if (Meteor.isClient) {
	describe('Api', function () {
		this.timeout(6000);
		describe('GroupApi', () => {
			describe('Get all groups', () => {
				it('should return JSON response', async () => {
					const groups = Meteor.absoluteUrl('/api/0/json/groups');
					const result = await fetch(groups);
					assertGoodHeaders(result);
				});
			});
		});
		describe('EventApi', () => {
			describe('Get all events', () => {
				it('returns JSON response', async () => {
					const events = Meteor.absoluteUrl('/api/0/json/events');

					const result = await fetch(events);
					assertGoodHeaders(result);

					const json = await result.json();
					const { data } = json;
					assert.isNotEmpty(data);
				});
			});

			describe('Get events from the future', () => {
				it('returns nonempty JSON response', async () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now');

					const result = await fetch(events);
					assertGoodHeaders(result);

					const json = await result.json();
					const { data } = json;
					assert.isNotEmpty(data);

					const starts = _.pluck(data, 'start').map((datestr) => new Date(datestr));

					// Because we start at the current time, this test will also detect events
					// in the past as order violation
					starts.forEach(AssertAscending(new Date(), 'event are sorted next first when no order specified'));
				});
				it('sorts by start-date', async () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now&sort=start');

					const result = await fetch(events);
					assertGoodHeaders(result);
					const json = await result.json();
					const starts = _.pluck(json.data, 'start').map((datestr) => new Date(datestr));
					starts.forEach(AssertAscending(new Date(), 'ascending ordering of start-dates was requested'));
				});

				it('sorts by title, descending', async () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now&sort=-title');

					const result = await fetch(events);
					assertGoodHeaders(result);
					const json = await result.json();
					const titles = _.pluck(json.data, 'title');
					titles.reverse();
					titles.forEach(AssertAscendingString('', 'descending ordering of titles was requested'));
				});
			});

			describe.skip('Filtering API ', () => {
				it('finds events for group', async () => {
					const groupId = '43df1efc02'; // "DIY-BE" group
					const events = Meteor.absoluteUrl(`/api/0/json/events?group=${groupId}`);
					const result = await fetch(events);
					assertGoodHeaders(result);
					const json = await result.json();
					const { data } = json;
					assert.isNotEmpty(data);
					data.forEach((event) => {
						assert.include(event.groups, groupId, 'only events for selected group');
					});
				});
			});

			describe('Get events from the past', () => {
				it('should return JSON response', async () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?before=now');
					const result = await fetch(events);
					assertGoodHeaders(result);
					const json = await result.json();
					const { data } = json;
					assert.isNotEmpty(data);

					const starts = _.pluck(json.data, 'start').map((datestr) => new Date(datestr));

					// Because we start at the current time, this test will also detect if events from the
					// future as order violation
					starts.forEach(AssertDescending(new Date(), 'when filtering for past dates events are sorted newest-first when no order is specified'));
				});
			});
		});

		describe('VenueApi', () => {
			describe('Get all venues', () => {
				it('should return JSON response', async () => {
					const venues = Meteor.absoluteUrl('/api/0/json/venues');
					const result = await fetch(venues);
					assertGoodHeaders(result);
				});
			});

			describe('region filtering', () => {
				it('should only return a certain region', async () => {
					const testistan = '9JyFCoKWkxnf8LWPh';
					const venues = Meteor.absoluteUrl(`/api/0/json/venues?region=${testistan}`);
					const result = await fetch(venues);
					const json = await result.json();
					const { data } = json;
					assert.isNotEmpty(data);
					data.forEach((element) => {
						assert.equal(element.region, testistan, 'region must be testistan');
					});
				});
			});

			// This test is skipped until it's fixed upstream
			// See #1143
			describe.skip('percent in query parameter', () => {
				it('should return JSON response', async () => {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?%');
					const result = await fetch(venues);
					assertGoodHeaders(result);
				});
			});

			describe('unicode query parameter', () => {
				it('should return JSON response', async () => {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?region=💩');
					const result = await fetch(venues);
					assertGoodHeaders(result);
				});
			});
		});
	});
}
