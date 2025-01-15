import { Subscription } from "meteor/meteor";
import { EJSON } from "meteor/ejson";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { publish, QueryBuilder } from "./ServerPublishUtils";
import { useUserId } from "./react-meteor-data";

export interface Publication<A extends any[], T> {
  /**
   * Subscribe to the record set.
   */
  (...args: A): [isLoading: () => boolean, data: T];
}

export function createPublicationMany<A extends any[], T>(
  name: string,
  queryBuilder: QueryBuilder<A, Mongo.Cursor<T, T>>,
) {
  return function (...args: A) {
    const isLoading = useSubscribe(name, ...args);
    const userId = useUserId();
    return [
      isLoading,
      useTracker(
        () => queryBuilder.call({ userId }, ...args).fetch(),
        [EJSON.stringify(args as any), userId],
      ),
    ];
  };
}

export function createPublicationOne<A extends any[], T>(
  name: string,
  queryBuilder: QueryBuilder<A, T>,
): Publication<A, T> {
  return function (...args: A) {
    const isLoading = useSubscribe(name, ...args);
    const userId = useUserId();
    return [
      isLoading,
      useTracker(
        () => queryBuilder.call({ userId }, ...args),
        [EJSON.stringify(args as any), userId],
      ),
    ];
  };
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
export function ServerPublishMany<A extends any[], T>(
  name: string,
  publisher: (this: Pick<Subscription, "userId">, ...args: A) => Mongo.Cursor<T>,
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
  publisher: (
    this: Subscription,
    ...args: A
  ) => Promise<Mongo.Cursor<T>> | Mongo.Cursor<T> | undefined,
  queryBuilder: QueryBuilder<A, Mongo.Cursor<T>>,
): Publication<A, T[]>;

export function ServerPublishMany<A extends any[], T>(
  name: string,
  publisher: (
    this: Subscription,
    ...args: A
  ) => Promise<Mongo.Cursor<T>> | Mongo.Cursor<T> | undefined,
  queryBuilder: QueryBuilder<A, Mongo.Cursor<T>> = publisher as QueryBuilder<A, Mongo.Cursor<T>>,
) {
  publish(name, publisher);

  // give back a Publication that a client can subscribe
  return createPublicationMany<A, T>(name, queryBuilder);
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
  publish(name, publisher);

  // give back a Publication that a client can subscribe
  return createPublicationOne<A, T>(name, queryBuilder);
}
