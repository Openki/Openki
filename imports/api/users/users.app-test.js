import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';


createDummy = function() {
	return "test" + Date.now() + Math.random(1000);
}

if (Meteor.isClient) {
	describe('Profile', function() {
		this.timeout(2000);
		const dummy = createDummy()
		describe('User creation', function() {
			it('updates the acceptsMessage flag', function() {
				return new Promise((resolve, reject) => {
					Accounts.createUser({
						username: dummy,
						email: dummy + "@openki.example",
						profile: { name : dummy },
						password: "hunter2"
					}, (error) => {
						assert.isNotOk(error, "not expecting creation errors");

						// Rely on the test runner to declare the test failed when it
						// never resolves. There is no assert(). Improvements welcome.
						Meteor.users.find({ username: dummy, acceptsMessages: true}).observe({
							added: resolve
						});
					});
				});
			});
		});
		describe('User modification', function() {
			this.timeout(1000)
			const changedDummy = createDummy()
			it('changes the username', function() {
				return new Promise((resolve, reject) => {
					const user = Accounts.findUserByUsername(dummy);
					Meteor.call('user.updateData',
						createDummy(),
						user.emails[0].address,
						user.notifications,
						function(err) {
							if (err) {
								assert.isNotOk(err, "not expecting username-change errors");
							} else {
								assert.isOk(true, 'username-change passed');
							}
						}
					);
				});
			});

			it('changes the email-address', function() {
				return new Promise((resolve, reject) => {
					const user = Accounts.findUserByUsername(changedDummy);
					Meteor.call('user.updateData',
						user.username,
						user.username + '@openki.example',
						user.notifications,
						function(err) {
							if (err) {
								assert.isNotOk(err, "not expecting email-change errors");
							} else {
								assert.isOk(true, 'email-change passed');
							}
						}
					);
				});
			});

			it('changes the notifiction-settings', function() {
				return new Promise((resolve, reject) => {
					const user = Accounts.findUserByUsername(changedDummy);
					Meteor.call('user.updateData',
						user.username,
						user.emails[0].address,
						!user.notifications,
						function(err) {
							if (err) {
								assert.isNotOk(err, "not expecting notification-change errors");
							} else {
								assert.isOk(true, 'notification-change passed');
							}
						}
					);
				});
			});
		});
	});
}
