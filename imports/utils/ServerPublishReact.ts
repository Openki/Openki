import { Meteor, Subscription } from 'meteor/meteor';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';

interface Publication<A extends any[], T> {
	/**
	 * Subscribe to the record set.
	 */
	(...args: A): [isLoading: () => boolean, data: T];
}

type QueryBuilder<A extends any[], T> = (
	this: { userId: ReturnType<typeof Meteor['userId']> },
	...args: A
) => T;

/**
 * Registers a function as a meteor publish and makes it subscribable for the client.
 *
 * This helps to make the publish type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 *
 * @param name Name of the record set.
 * @param publisher Function called on the server each time a client subscribes.
 * @returns A Publication that a client can subscribe to.
 */
export function ServerPublishMany<A extends any[], T>(
	name: string,
	publisher: (this: Pick<Subscription, 'userId'>, ...args: A) => Mongo.Cursor<T>,
): Publication<A, T[]>;

/**
 * Registers a function as a meteor publish and makes it subscribable for the client.
 *
 * This helps to make the publish type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 *
 * @param name Name of the record set.
 * @param publisher Function called on the server each time a client subscribes. Inside the function,
 * `this` is the publish handler object.
 * @param queryBuilder Function called on the client, this is usefull if the call on the client
 * differ from the server.
 * See https://guide.meteor.com/data-loading.html
 * @returns A Publication that a client can subscribe to.
 */
export function ServerPublishMany<A extends any[], T>(
	name: string,
	publisher: (this: Subscription, ...args: A) => undefined,
	queryBuilder: QueryBuilder<A, Mongo.Cursor<T>>,
): Publication<A, T[]>;

export function ServerPublishMany<A extends any[], T>(
	name: string,
	publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T> | undefined,
	queryBuilder: QueryBuilder<A, Mongo.Cursor<T>> = publisher as QueryBuilder<A, Mongo.Cursor<T>>,
) {
	if (Meteor.isServer) {
		// on the server register the publisher / publish the record set
		// wrap the call to handle options
		Meteor.publish(name, function (...args) {
			// everyting is okay, do the work
			const result = publisher.call(this, ...args);
			if (result === undefined) {
				this.ready();
			}
			return result;
		});
	}

	// give back a Publication that a client can subscribe
	const publication = function (...args: A) {
		const isLoading = useSubscribe(name, ...args);
		return [
			isLoading,
			useFind<T>(() => queryBuilder.call({ userId: Meteor.userId() }, ...args), args),
		];
	};

	return publication;
}

/**
 * Registers a function as a meteor publish and makes it subscribable for the client.
 *
 * This helps to make the publish type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 *
 * @param name Name of the record set.
 * @param publisher Function called on the server each time a client subscribes. Inside the function,
 * `this` is the publish handler object.
 * @param queryBuilder Function called on the client, this is usefull if the call on the client
 * differ from the server eg. `.findOne(...)`.
 * See https://guide.meteor.com/data-loading.html
 * @returns A Publication that a client can subscribe to.
 */
export function ServerPublishOne<A extends any[], T>(
	name: string,
	publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T>,
	queryBuilder: QueryBuilder<A, T>,
): Publication<A, T> {
	if (Meteor.isServer) {
		// on the server register the publisher / publish the record set
		// wrap the call to handle options
		Meteor.publish(name, function (...args) {
			// everyting is okay, do the work
			return publisher.call(this, ...args);
		});
	}

	// give back a Publication that a client can subscribe
	const publication = function (...args: A): [() => boolean, T] {
		const isLoading = useSubscribe(name, ...args);
		return [isLoading, queryBuilder.call({ userId: Meteor.userId() }, ...args)];
	};

	return publication;
}
