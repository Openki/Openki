import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import fetch from 'isomorphic-unfetch';
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
		this.timeout(2000);
		describe('GroupApi', () => {
			describe('Get all groups', () => {
				it('should return JSON response', () => {
					const groups = Meteor.absoluteUrl('/api/0/json/groups');
					return fetch(groups).then(assertGoodHeaders);
				});
			});
		});
		describe('EventApi', () => {
			describe('Get all events', () => {
				it('returns JSON response', () => {
					const events = Meteor.absoluteUrl('/api/0/json/events');
					return fetch(events).then((result) => {
						assertGoodHeaders(result);
						return result.json();
					}).then((json) => {
						const { data } = json;
						assert.isNotEmpty(data);
					});
				});
			});

			describe('Get events from the future', () => {
				it('returns nonempty JSON response', () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now');
					return fetch(events).then((result) => {
						assertGoodHeaders(result);
						return result.json();
					}).then((json) => {
						const { data } = json;
						assert.isNotEmpty(data);

						const starts = _.pluck(data, 'start').map(datestr => new Date(datestr));

						// Because we start at the current time, this test will also detect events
						// in the past as order violation
						starts.forEach(AssertAscending(new Date(), 'event are sorted next first when no order specified'));
					});
				});
				it('sorts by start-date', () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now&sort=start');
					return fetch(events).then((result) => {
						assertGoodHeaders(result);
						return result.json();
					}).then((json) => {
						const starts = _.pluck(json.data, 'start').map(datestr => new Date(datestr));
						starts.forEach(AssertAscending(new Date(), 'ascending ordering of start-dates was requested'));
					});
				});

				it('sorts by title, descending', () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now&sort=-title');
					return fetch(events).then((result) => {
						assertGoodHeaders(result);
						return result.json();
					}).then((json) => {
						const titles = _.pluck(json.data, 'title');
						titles.reverse();
						titles.forEach(AssertAscendingString('', 'descending ordering of titles was requested'));
					});
				});
			});

			describe.skip('Filtering API ', () => {
				it('finds events for group', () => {
					const groupId = '43df1efc02'; // "DIY-BE" group
					const events = Meteor.absoluteUrl(`/api/0/json/events?group=${groupId}`);
					return fetch(events).then((result) => {
						assertGoodHeaders(result);
						return result.json();
					}).then((json) => {
						const { data } = json;
						assert.isNotEmpty(data);
						data.forEach((event) => {
							assert.include(event.groups, groupId, 'only events for selected group');
						});
					});
				});
			});

			describe('Get events from the past', () => {
				it('should return JSON response', () => {
					const events = Meteor.absoluteUrl('/api/0/json/events?before=now');
					return fetch(events).then((result) => {
						assertGoodHeaders(result);
						return result.json();
					}).then((json) => {
						const { data } = json;
						assert.isNotEmpty(data);

						const starts = _.pluck(json.data, 'start').map(datestr => new Date(datestr));

						// Because we start at the current time, this test will also detect if events from the
						// future as order violation
						starts.forEach(AssertDescending(new Date(), 'when filtering for past dates events are sorted newest-first when no order is specified'));
					});
				});
			});
		});

		describe('VenueApi', () => {
			describe('Get all venues', () => {
				it('should return JSON response', () => {
					const venues = Meteor.absoluteUrl('/api/0/json/venues');
					return fetch(venues).then((result) => {
						assertGoodHeaders(result);
					});
				});
			});

			describe('region filtering', () => {
				it('should only return a certain region', () => {
					const testistan = '9JyFCoKWkxnf8LWPh';
					const venues = Meteor.absoluteUrl(`/api/0/json/venues?region=${testistan}`);
					return fetch(venues)
						.then(result => result.json())
						.then((json) => {
							const { data } = json;
							assert.isNotEmpty(data);
							data.forEach((element) => {
								assert.equal(element.region, testistan, 'region must be testistan');
							});
						});
				});
			});

			// This test is skipped until it's fixed upstream
			// See #1143
			describe.skip('percent in query parameter', () => {
				it('should return JSON response', () => {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?%');
					return fetch(venues).then(assertGoodHeaders);
				});
			});

			describe('unicode query parameter', () => {
				it('should return JSON response', () => {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?region=💩');
					return fetch(venues).then(assertGoodHeaders);
				});
			});
		});
	});
}
