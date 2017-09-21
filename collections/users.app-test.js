import { Meteor } from 'meteor/meteor';
import { expect } from 'meteor/practicalmeteor:chai';

// Same as greg's
const seesDigestedPassword = {
	"digest":"0d2c690e7dd5f94780383e9dfa1f4def044319104ad16ab15e45eeb2a8dfc81b",
	"algorithm":"sha-256"
};

if (Meteor.isClient) {
	describe('Profile', function () {
		it('accepts login', function (done) {
			Meteor.call('login',
				{ "user": { "username": "Seee" }
				, "password": seesDigestedPassword
				}
				, (err, response) => {
					return done(err);
				}
			);
		});
		it('does not allow setting duplicate email', function (done) {
			Meteor.call('update_userdata',
				"Seee",
				"greg@openki.example",
				false,
				(err, response) => {
					expect(err).to.be.an('object');
					done();
				}
			);
		});
	});
}
