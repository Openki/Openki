import { Meteor, Subscription } from 'meteor/meteor';

export interface Subscriber {
	subscribe(name: string, ...args: any[]): Meteor.SubscriptionHandle;
}

export interface SubscriptionHandle<T> {
	/** Query the loaded data. */
	(): T;
	/** True if the server has marked the subscription as ready. A reactive data source. */
	ready(): boolean;
	/**
	 * Cancel the subscription. This will typically result in the server directing the client to
	 * remove the subscription’s data from the client’s cache.
	 */
	stop(): void;
}

export interface Publication<T extends any[], D> {
	/**
	 * Subscribe to the record set.
	 */
	subscribe(...args: T): SubscriptionHandle<D>;
	/**
	 * Subscribe to the record set. With a other subscriber eg. the Blaze template instance.
	 */
	subscribe(subscriber?: Subscriber | undefined, ...args: T): SubscriptionHandle<D>;
}

export type SubscriptionType<
	P extends Publication<T, D>,
	T extends any[] = any,
	D = any,
> = ReturnType<P['subscribe']>;

export type Record<T extends readonly Mongo.Cursor<any>[]> = Mongo.Cursor<any> | [...T] | undefined;

type QueryBuilder<T extends any[], R> = (
	this: { userId: ReturnType<typeof Meteor['userId']> },
	...args: T
) => R;

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
export function ServerPublish<
	T extends any[],
	C extends readonly Mongo.Cursor<any>[],
	R extends Record<C>,
>(
	name: string,
	publisher: (this: Pick<Subscription, 'userId'>, ...args: T) => R,
): Publication<T, R>;

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
export function ServerPublish<
	T extends any[],
	C extends readonly Mongo.Cursor<any>[],
	R extends Record<C>,
	Q,
>(
	name: string,
	publisher: (this: Subscription, ...args: T) => R | void,
	queryBuilder: QueryBuilder<T, Q>,
): Publication<T, Q>;
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
export function ServerPublish<
	T extends any[],
	C extends readonly Mongo.Cursor<any>[],
	R extends Record<C>,
	Q extends R | any,
>(
	name: string,
	publisher: (this: Subscription, ...args: T) => R | void,
	queryBuilder: QueryBuilder<T, Q> = publisher as QueryBuilder<T, Q>,
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
		subscribe(...args: T) {
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
			query.ready = function () {
				return handle.ready();
			};
			query.stop = function () {
				handle.stop();
			};
			return query;
		},
	} as Publication<T, Q>;
}
