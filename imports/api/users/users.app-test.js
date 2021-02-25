import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';


const createDummy = function () {
	return `test${Date.now()}${Math.random(1000000)}`;
};

if (Meteor.isClient) {
	describe('Profile', function () {
		this.timeout(30000);
		describe('User creation', () => {
			it('updates the acceptsMessage flag', () => new Promise((resolve) => {
				const dummy = createDummy();
				Accounts.createUser({
					username: dummy,
					email: `${dummy}@openki.example`,
					profile: { name: dummy },
					password: 'hunter2',
				}, (error) => {
					assert.isNotOk(error, 'not expecting creation errors');

					// Rely on the test runner to declare the test failed when it
					// never resolves. There is no assert(). Improvements welcome.
					Meteor.users.find({ username: dummy, acceptsPrivateMessages: true }).observe({
						added: resolve,
					});
				});
			}));
		});

		describe('User modification', function () {
			this.timeout(30000);
			const oldDummy = createDummy();
			const newDummy = createDummy();
			it('changes the username', () => new Promise((resolve, reject) => {
				Accounts.createUser({
					username: oldDummy,
					email: `${oldDummy}@openki.example`,
					profile: { name: oldDummy },
					password: 'hunter2',
				}, (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			}).then(() => new Promise((resolve, reject) => {
				Meteor.loginWithPassword(oldDummy, 'hunter2', (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			})).then(() => new Promise((resolve) => {
				Meteor.call('user.updateUsername', newDummy, (err) => {
					if (err) {
						assert.isNotOk(err, 'not expecting username-change errors');
					}

					Meteor.users.find({ username: newDummy }).observe({
						added: () => {
							resolve();
						},
					});
				});
			})).then(() => {
				// check if username has changed to the correct string
				const user = Meteor.user();
				assert.strictEqual(newDummy, user.username, 'username was changed successfully');
			}));
		});
	});
}
