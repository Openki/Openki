import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import fetch from 'isomorphic-unfetch';

// In theory this test could actually be run on the server as well. Regrettably
// the test runner starts the server tests before the database is fully
// populated. As a result those tests will very likely time out.
if (Meteor.isClient) {

	describe('Api', function () {
		this.timeout(15000);
		describe('GroupApi', function () {
			describe('Get all groups', function(){
				it('should return JSON response', function (done) {
					const groups = Meteor.absoluteUrl('/api/0/json/groups');
					fetch(groups).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						done();
					});
				});
			});
		});
		describe('EventApi', function () {
			describe('Get all events', function(){
				it('should return JSON response', function (done) {
					const events = Meteor.absoluteUrl('/api/0/json/events');
					fetch(events).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						done();
					});
				});
			});
			describe('Get events from the future', function(){
				it('should return JSON response', function (done) {
					const events = Meteor.absoluteUrl('/api/0/json/events?after=now');
					fetch(events).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						result.json().then((json)=>{
							expect(json.data.length).to.be.above(0);
							done();
						});
					});
				});
			});
			describe('Get events from the past', function(){
				it('should return JSON response', function (done) {
					const events = Meteor.absoluteUrl('/api/0/json/events?before=now');
					fetch(events).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						result.json().then((json)=>{
							expect(json.data.length).to.be.above(0);
							done();
						});
					});
				});
			});
		});
				
		describe('VenueApi', function () {
			describe('Get all venues', function () {
				it('should return JSON response', function (done) {
					const venues = Meteor.absoluteUrl('/api/0/json/venues');
					fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						done();
					});
				});
			});
			describe('region filtering', function () {
				it('should only return a certain region', function (done) {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?region=J6GDhEEvdmdSMzPPF');
					fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						result.json().then((json)=>{
							expect(json.data.length).to.be.above(0);
							json.data.forEach(element => {
								expect(element.region).to.be.equal("J6GDhEEvdmdSMzPPF");
							});
							done();
						});
					});
				});
			});
			describe('percent in query parameter', function () {
				it('should return JSON response', function (done) {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?%');
					fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						done();
					});
				});
			});
			describe('unicode query parameter', function () {
				it('should return JSON response', function (done) {
					const venues = Meteor.absoluteUrl('/api/0/json/venues?region=💩');
					fetch(venues).then((result) => {
						expect(result.status).to.equal(200);
						expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
						done();
					});
				});
			});
		});
	});
}
