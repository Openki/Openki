import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

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
					assert.isObject(err);
					done();
				}
			);
		});
	});

	describe('User search', function() {
		it('finds none for nonexisting name', (done) => {
			// How could I check whether nothing was found
			// for a non-existing user? I'm going to watch the Users
			// collection for additions between the subscription for a
			// non-existing user and the conclusion of this subscription.
			let added;

			// This will track addition of users
			const cursor = Meteor.users.find();
			cursor.observe({ added: () => { added = true; } });

			// Reset the flag before starting the subscription
			added = false;
			const sub = Meteor.subscribe('userSearch', 'SOMEUSERTHATDOESNOTEXIST', () => {
				sub.stop();
				assert.isFalse(added);
				done();
			});
		});

		it('finds some user', (done) => {
			const someUser = 'gregen';
			const sub = Meteor.subscribe('userSearch', someUser, () => {
				sub.stop();
				const cursor = UserLib.searchPrefix(someUser, {});
				assert(cursor.count() > 0);
				done();
			});
		});

		it('finds Chnöde when searching for "Chn"', (done) => {
			const sub = Meteor.subscribe('userSearch', "Chn", () => {
				sub.stop();
				const cursor = UserLib.searchPrefix("Chnöde", {});
				assert(cursor.count() > 0);
				done();
			});
		});
	});
}
