import { promisify } from 'es6-promisify';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit asnyc/await.
 */
export const MeteorAsync = {
	/** @type {(name: string, ...args: any[]) => Promise<any>} */
	callAsync:
	// On the server there should be a callAsync: https://docs.meteor.com/changelog.html#v14420170407
	Meteor.callAsync ? Meteor.callAsync
		: Meteor.call
		&& ((/** @type {string} */ name, ...args) => new Promise((resolve, reject) => {
			Meteor.call(name, ...args,
				(err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				});
		})),
	/** @type {(name: string, ...args: any[]) => Promise<Meteor.SubscriptionHandle>} */
	subscribeAsync: Meteor.subscribe
		&& ((/** @type {string} */ name, ...args) => new Promise((resolve, reject) => {
			const handle = Meteor.subscribe(name, ...args, {
				onReady: () => {
					resolve(handle);
				},
				onStop: (err) => {
					if (err) {
						reject(err);
					}
				},
			});
		})),
	loginWithPasswordAsync: Meteor.loginWithPassword && promisify(Meteor.loginWithPassword),
	logoutAsync: Meteor.logout && promisify(Meteor.logout),
};

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit asnyc/await.
 */
export const AccountsAsync = {
	createUserAsync: Accounts.createUser && promisify(Accounts.createUser),
};

export default MeteorAsync;
