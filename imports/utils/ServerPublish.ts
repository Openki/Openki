import { Subscription } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import * as Blaze from "./ServerPublishBlaze";
import * as React from "./ServerPublishReact";
import { publish, QueryBuilder } from "./ServerPublishUtils";

/**
 * Registers a function as a meteor publish and makes it subscribable for the client.
 *
 * This helps to make the publication type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 *
 * @param name Name of the record set.
 * @param publisher Function called on the server each time a client subscribes.
 * @returns A Publication that a client can subscribe to.
 */
export function ServerPublishMany<A extends any[], T, U>(
  name: string,
  publisher: (this: Pick<Subscription, "userId">, ...args: A) => Mongo.Cursor<T, U>,
): [Blaze.Publication<A, Mongo.Cursor<T, U>>, React.Publication<A, U[]>];

/**
 * Registers a function as a meteor publish and makes it subscribable for the client.
 *
 * This helps to make the publication type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 *
 * @param name Name of the record set.
 * @param publisher Function called on the server each time a client subscribes.
 * Inside the function, `this` is the publish handler object.
 * NOTE: When using MongoDB `projection` in the `publisher` function,
 * make sure the `projection` includes all properties needed for MongoDB queries
 * (using `.find()` and similar) in the `queryBuilder` function.
 * @param queryBuilder Function called on the client, this is useful if the call on the client
 * differ from the server eg. `.findOne(...)`.
 * See https://guide.meteor.com/data-loading.html
 * @returns A Publication that a client can subscribe to.
 */
export function ServerPublishMany<A extends any[], T, U>(
  name: string,
  publisher: (
    this: Subscription,
    ...args: A
  ) => Promise<Mongo.Cursor<T, U>> | Mongo.Cursor<T, U> | undefined,
  queryBuilder: QueryBuilder<A, Mongo.Cursor<T, U>>,
): [Blaze.Publication<A, Mongo.Cursor<T, U>>, React.Publication<A, U[]>];

export function ServerPublishMany<A extends any[], T, U>(
  name: string,
  publisher: (
    this: Subscription,
    ...args: A
  ) => Promise<Mongo.Cursor<T, U>> | Mongo.Cursor<T, U> | undefined,
  queryBuilder: QueryBuilder<A, Mongo.Cursor<T, U>> = publisher as unknown as QueryBuilder<
    A,
    Mongo.Cursor<T, U>
  >,
) {
  publish(name, publisher);
  return [
    Blaze.createPublication<A, U>(name, queryBuilder as any),
    React.createPublicationMany<A, U>(name, queryBuilder as any),
  ];
}

export function ServerPublishOne<A extends any[], T, U extends object | undefined>(
  name: string,
  publisher: (this: Subscription, ...args: A) => Promise<Mongo.Cursor<T, U>> | Mongo.Cursor<T, U>,
  queryBuilder: QueryBuilder<A, U>,
): [Blaze.Publication<A, U>, React.Publication<A, U>] {
  publish(name, publisher);

  return [
    Blaze.createPublication<A, U>(name, queryBuilder),
    React.createPublicationOne<A, U>(name, queryBuilder),
  ];
}
