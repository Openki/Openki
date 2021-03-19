import { promisify } from 'es6-promisify';
import { Meteor } from 'meteor/meteor';

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit asnyc/await.
 * Note: Meteor.callAsync already exists but is not well documented.
*/
export const MeteorAsync = {
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
