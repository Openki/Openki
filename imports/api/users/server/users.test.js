import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';
import UserSearchPrefix from '/imports/utils/user-search-prefix.js';

if (Meteor.isClient) {
	describe('Profile', function () {
		it('accepts login', function (done) {
			Meteor.loginWithPassword("Seee", "greg", (err, response) => {
				return done(err);
			});
		});
		it('does not allow setting duplicate email', function (done) {
			Meteor.call('user.updateData',
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
				const cursor = UserSearchPrefix(someUser, {});
				assert(cursor.count() > 0);
				done();
			});
		});

		it('finds Chnöde when searching for "Chn"', (done) => {
			const sub = Meteor.subscribe('userSearch', "Chn", () => {
				sub.stop();
				const cursor = UserSearchPrefix("Chnöde", {});
				assert(cursor.count() > 0);
				done();
			});
		});
	});
}
