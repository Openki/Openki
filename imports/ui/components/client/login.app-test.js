import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';

const gregsDigestedPassword = {
	digest: '0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b',
	algorithm: 'sha-256',
};

const invalidDigestedPassword = {
	digest: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
	algorithm: 'sha-256',
};

if (Meteor.isClient) {
	// eslint-disable-next-line func-names
	describe('Login', function () {
		this.timeout(10000);
		it('should work with good credentials', (done) => {
			Meteor.call('login',
				{
					user: { username: 'greg' },
					password: gregsDigestedPassword,
				},
				// eslint-disable-next-line consistent-return
				(err, response) => {
					if (err) return done(err);
					expect(response.token).to.be.a('string');
					done();
				});
		});

		it('should fail with bad username', (done) => {
			Meteor.call('login',
				{
					user: { username: 'bogus username' },
					password: gregsDigestedPassword,
				},
				(err) => {
					expect(err).to.be.an('object');
					expect(err.error).to.equal(403);
					done();
				});
		});

		it('should fail with bad password', (done) => {
			Meteor.call('login',
				{
					user: { username: 'greg' },
					password: invalidDigestedPassword,
				},
				(err) => {
					expect(err).to.be.an('object');
					expect(err.error).to.equal(403);
					done();
				});
		});
	});
}
