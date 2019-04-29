import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';


const createDummy = function() {
	return "test" + Date.now() + Math.random(1000000);
}

if (Meteor.isClient) {
	describe('Profile', function() {
		this.timeout(2000);
		describe('User creation', function() {
			it('updates the acceptsMessage flag', function() {
				return new Promise((resolve, reject) => {
					const dummy = createDummy();
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
			const oldDummy = createDummy();
			const newDummy = createDummy();
			it('changes the username', function() {
				return new Promise((resolve, reject) => {
					Accounts.createUser({
						username: oldDummy,
						email: oldDummy + "@openki.example",
						profile: { name : oldDummy },
						password: "hunter2"
					}, (err) => {
						assert.isNotOk(error, "not expecting creation errors");

					});
					done();
				}, (err) => {
					assert.isNotOk(error, "not expecting creation errors");
				}).then((value) => {
					// Meteor.loginWithPassword(dummy, "hunter2", (err, response) => {
					// 	if (err) reject(err);
					// 	else done();
					// });
					console.log('########logged in user -> ' + Meteor.userId());
				}).then((value) => {
						console.log('logged in user -> ' + Meteor.userId());
				}).then((value) => {
					const user = Meteor.user();
					Meteor.call('user.updateData',
						newDummy,
						user.emails[0].address,
						user.notifications,
						function(err) {
							if (err) {
								assert.isNotOk(err, "not expecting username-change errors");
							}

							Meteor.users.find({ username: newDummy}).observe({
								added: resolve
							});
						}
					);
				}, (reason) => {
					console.log(reason);
				}).then((value) => {
						//check if username has changed to the correct string
						const user = Meteor.user();
						assert.strictEqual(newDummy, user.username, "username was changed successfully");
						done();
					}, (reason) => {
						console.log(reason);
					}
				);
			});
		});
	});
}
