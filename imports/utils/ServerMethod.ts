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
	options: {
		/**
		 * When a Method is called, it usually runs twice—once on the client to simulate the result
		 * for Optimistic UI, and again on the server to make the actual change to the database.
		 * Some methods can not simulated on the client (for example, if you didn’t load some data
		 * on the client that the Method needs to do the simulation properly). With
		 * `{ simulation: false }` you can disable simulation in this case. Default is `true`
		 */
		simulation: boolean;
	} = { simulation: true },
) {
	Meteor.methods({
		[name](...args) {
			if (Meteor.isClient && !options.simulation) {
				return undefined;
			}
			return run.call(this, ...args);
		},
	});

	return ((...args: T) => MeteorAsync.call(name, ...args)) as (...args: T) => Promise<R>;
}

export default ServerMethod;
