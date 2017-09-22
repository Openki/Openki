import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';
import fetch from 'isomorphic-unfetch';

// In theory this test could actually be run on the server as well. Regrettably
// the test runner starts the server tests before the database is fully
// populated. As a result those tests will very likely time out.
if (Meteor.isClient) {
	describe('GroupApi', function () {
		it('should return JSON response', function (done) {
			const groups = Meteor.absoluteUrl('/api/0/json/groups');
			fetch(groups).then((result) => {
				expect(result.status).to.equal(200);
				expect(result.headers.get('Content-Type')).to.equal('application/json; charset=utf-8');
				done();
			});
		});
	});
}
