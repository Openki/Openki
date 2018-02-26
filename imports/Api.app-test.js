import { Meteor } from 'meteor/meteor';
import { expect, assert } from 'chai';
import fetch from 'isomorphic-unfetch';

const AssertAscending = function(base) {
	let current = base;
	return function(next) {
		assert.isAtLeast(next, current);
		current = next;
	};
};

const AssertAscendingString = function(base) {
	let current = base;
	return function(next) {
		const nextDir = next.localeCompare(current, null, { sensitivity: "accent"});
		assert.isAtLeast(nextDir, 0);
		current = next;
	};
};

// In theory this test could actually be run on the server as well. Regrettably
// the test runner starts the server tests before the database is fully
// populated. As a result those tests will very likely time out.
if (Meteor.isClient) {

	describe('Api', function() {
		this.timeout(15000);
		describe('GroupApi', function() {
			describe('Get all groups', function(){
				it('should return JSON response', function() {
					const groups = Meteor.absoluteUrl('/api/0/json/groups');
					return fetch(groups).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
					});
				});
			});
		});
		describe('EventApi', function() {
			describe('Get all events', function(){
				it('should return JSON response', function() {
					const events = Meteor.absoluteUrl('/api/0/json/events');
					return fetch(events).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
					});
				});
			});
			describe('Get events from the future', function(){
				it('returns JSON response', function() {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now');
					fetch(events).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						return result.json();
					}).then((json) => {
						expect(json.data.length).to.be.above(0);
					});
				});
				it('sorts by start-date', function() {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now&sort=start');
					return fetch(events).then((result) => {
						return result.json();
					}).then((json) => {
						const starts = _.pluck(json.data, 'start').map((datestr) => new Date(datestr));
						starts.forEach(AssertAscending(new Date()));
					});
				});
				it('sorts by title, descending', function() {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now&sort=-title');
					return fetch(events).then((result) => {
						return result.json();
					}).then((json) => {
						const titles = _.pluck(json.data, 'title');
						titles.reverse();
						titles.forEach(AssertAscendingString(""));
					});
				});
			});
			describe('Get events from the past', function(){
				it('should return JSON response', function() {
					const events = Meteor.absoluteUrl('/api/0/json/events?before=now');
					return fetch(events).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						return result.json();
					}).then((json) => {
						expect(json.data.length).to.be.above(0);
					});
				});
			});
		});
				
		describe('VenueApi', function() {
			describe('Get all venues', function() {
				it('should return JSON response', function() {
					const venues = Meteor.absoluteUrl('/api/0/json/venues');
					return fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
					});
				});
			});

			describe('region filtering', function() {
				it('should only return a certain region', function() {
					const testistan = '9JyFCoKWkxnf8LWPh';
					const venues = Meteor.absoluteUrl('/api/0/json/venues?region=' + testistan);
					return fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						return result.json();
					}).then((json) => {
						expect(json.data.length).to.be.above(0);
						json.data.forEach(element => {
							expect(element.region).to.be.equal(testistan);
						});
					});
				});
			});

			// This test is skipped until it's fixed upstream
			// See #1143
			describe.skip('percent in query parameter', function() {
				it('should return JSON response', function() {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?%');
					return fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
					});
				});
			});
			describe('unicode query parameter', function() {
				it('should return JSON response', function() {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?region=💩');
					return fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
					});
				});
			});
		});
	});
}
