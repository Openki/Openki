import { promisify } from 'es6-promisify';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit asnyc/await.
 */
export const MeteorAsync = {
	call:
		// On the server there should be a callAsync: https://docs.meteor.com/changelog.html#v14420170407
		Meteor.callAsync
			? Meteor.callAsync
			: Meteor.call &&
			  ((name: string, ...args: any[]) =>
					new Promise((resolve, reject) => {
						Meteor.call(name, ...args, (err: any, res: any) => {
							if (err) {
								reject(err);
							} else {
								resolve(res);
							}
						});
					})),

	subscribe:
		Meteor.subscribe &&
		(function () {
			return (name: string, ...args: any[]) =>
				new Promise<Meteor.SubscriptionHandle>((resolve, reject) => {
					const handle = Meteor.subscribe(name, ...args, {
						onReady: () => {
							resolve(handle);
						},
						onStop: (err: any) => {
							if (err) {
								reject(err);
							}
						},
					});
				});
		})(),
	loginWithPassword:
		Meteor.loginWithPassword &&
		(promisify(Meteor.loginWithPassword) as (
			user: string | { email: string } | { username: string } | { id: string },
			password: string,
		) => Promise<void>),
	logout: Meteor.logout && promisify<void>(Meteor.logout),
};

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit asnyc/await.
 */
export const AccountsAsync = {
	createUser: Accounts.createUser && promisify(Accounts.createUser),
};

export default MeteorAsync;
