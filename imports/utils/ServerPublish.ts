import { Meteor, Subscription } from 'meteor/meteor';

export interface Subscriber {
	subscribe(name: string, ...args: any[]): Meteor.SubscriptionHandle;
}

export interface SubscriptionHandle<T> {
	/** Query the loaded data. */
	(): T;
	/** True if the server has marked the subscription as ready. A reactive data source. */
	isLoading(): boolean;
}

export interface Publication<A extends any[], T> {
	/**
	 * Subscribe to the record set.
	 */
	subscribe(...args: A): SubscriptionHandle<T>;
	/**
	 * Subscribe to the record set. With a other subscriber eg. the Blaze template instance.
	 */
	subscribe(subscriber?: Subscriber | undefined, ...args: A): SubscriptionHandle<T>;
}

export type SubscriptionType<
	P extends Publication<A, T>,
	A extends any[] = any,
	T = any,
> = ReturnType<P['subscribe']>;

export type Record<T extends readonly Mongo.Cursor<any>[]> = Mongo.Cursor<any> | [...T] | undefined;

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
function ServerPublish<
	A extends any[],
	C extends readonly Mongo.Cursor<any>[],
	T extends Record<C>,
>(
	name: string,
	publisher: (this: Pick<Subscription, 'userId'>, ...args: A) => T,
): Publication<A, T>;

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
function ServerPublish<
	A extends any[],
	C extends readonly Mongo.Cursor<any>[],
	T extends Record<C>,
	Q,
>(
	name: string,
	publisher: (this: Subscription, ...args: A) => T | void,
	queryBuilder: QueryBuilder<A, Q>,
): Publication<A, Q>;

function ServerPublish<
	A extends any[],
	C extends readonly Mongo.Cursor<any>[],
	T extends Record<C>,
	Q extends T | any,
>(
	name: string,
	publisher: (this: Subscription, ...args: A) => T | void,
	queryBuilder: QueryBuilder<A, Q> = publisher as QueryBuilder<A, Q>,
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
	return {
		subscribe(...args: A) {
			let subscriber: Subscriber = Meteor;

			const firstArg = args[0];
			if (firstArg && typeof firstArg.subscribe === 'function') {
				subscriber = args.shift();
			}

			const handle = subscriber.subscribe(name, ...args);

			// Remove callback function
			// Inspired from https://github.com/meteor/meteor/blob/master/packages/ddp-client/common/livedata_connection.js#L347
			if (args.length) {
				const lastParam = args[args.length - 1];
				if (
					lastParam &&
					(typeof lastParam === 'function' ||
						[lastParam.onReady, lastParam.onStop].some((f) => typeof f === 'function'))
				) {
					args.pop();
				}
			}

			const query = function () {
				return queryBuilder.call({ userId: Meteor.userId() }, ...args);
			};
			query.isLoading = function () {
				return handle.ready();
			};
			return query;
		},
	} as Publication<A, Q>;
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
 * @param publisher Function called on the server each time a client subscribes.
 * @returns A Publication that a client can subscribe to.
 */
export function ServerPublishMany<A extends any[], T extends Mongo.Cursor<any>>(
	name: string,
	publisher: (this: Pick<Subscription, 'userId'>, ...args: A) => T,
): Publication<A, T>;

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
export function ServerPublishMany<A extends any[], T>(
	name: string,
	publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T> | undefined,
	queryBuilder: QueryBuilder<A, T>,
): Publication<A, T>;

export function ServerPublishMany<A extends any[], T>(
	name: string,
	publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T> | undefined,
	queryBuilder: QueryBuilder<A, T> = publisher as QueryBuilder<A, T>,
) {
	return ServerPublish(name, publisher as any, queryBuilder as any);
}

export function ServerPublishOne<A extends any[], T>(
	name: string,
	publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T>,
	queryBuilder: QueryBuilder<A, T>,
) {
	return ServerPublish(name, publisher, queryBuilder);
}
