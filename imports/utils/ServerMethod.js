import { Meteor } from 'meteor/meteor';
import { MeteorAsync } from './promisify';

/**
 * Registers a function as a meteor method and makes it callable.
 * https://docs.meteor.com/api/methods.html
 *
 * This helps to make the method type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 * @template {any[]} T
 * @template R
 * @param {string} name
 * @param {(this: Meteor.MethodThisType, ...args: T) => R} run
 * @returns {(...args: T) => Promise<R>}
 */
export function ServerMethod(name, run) {
	Meteor.methods({
		[name](args) {
			return run.call(this, args);
		},
	});

	return (/** @type {T} */ ...args) => MeteorAsync.callAsync(name, ...args);
}

export default ServerMethod;
