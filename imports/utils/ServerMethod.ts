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
 */
export function ServerMethod<T extends any[], R>(
	name: string,
	run: (this: Meteor.MethodThisType, ...args: T) => R,
) {
	Meteor.methods({
		[name](...args) {
			return run.call(this, ...args);
		},
	});

	return ((...args: T) => MeteorAsync.call(name, ...args)) as (...args: T) => Promise<R>;
}

export default ServerMethod;
