import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';


const createDummy = function() {
	return "test" + Date.now() + Math.random(1000);
}

if (Meteor.isClient) {
	describe.only('Profile', function() {
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
			const changedDummy = createDummy();
			it('changes the username', function() {
				return new Promise((resolve, reject) => {

				}, (err) => {

				}).then(() => new Promise((done, reject) => {
					Meteor.loginWithPassword(dummy, "hunter2", (err, response) => {
						if (err) reject(err);
						else done();
					});
				}).then(
					console.log('loggd in user -> ' + Meteor.userId());
				).then(
					const user = Meteor.user();
					Meteor.call('user.updateData',
						createDummy(),
						user.emails[0].address,
						user.notifications,
						function(err) {
							if (err) {
								assert.isNotOk(err, "not expecting username-change errors");
							}
						}
					);
				).then(
					//check if username has changed to the correct string
					const user = Meteor.user();
					assert.strictMatch(user.username, changedDummy, "username was changed successfully");
				);
			});
		});
	});
}
