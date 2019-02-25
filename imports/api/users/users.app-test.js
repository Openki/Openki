import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';


if (Meteor.isClient) {
	describe('Profile', function() {
		this.timeout(2000);
		describe('User creation', function() {
			it('updates the acceptsMessage flag', function() {
				return new Promise((resolve, reject) => {
					const dummy = "test" + Date.now() + Math.random(1000);
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
	});
}