import { Subscription } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { QueryBuilder } from "./ServerPublishUtils";
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]> | undefined | null;
} : T;
/**
 * Subscribe to the record set.
 */
declare function publication<A extends any[], T>(...args: A): [isLoading: () => boolean, data: T];
/**
 * Subscribe to the record set, when the condition is true.
 * @param condition true: date get loaded; false: none date get loaded, isLoading() will always return false
 */
declare function publication<A extends any[], T>(condition: {
    when: boolean;
}, ...args: DeepPartial<A>): [isLoading: () => boolean, data: T | undefined];
export type Publication<A extends any[], T> = typeof publication<A, T>;
export declare function createPublicationMany<A extends any[], T>(name: string, queryBuilder: QueryBuilder<A, Mongo.Cursor<T, T>>): Publication<A, T>;
export declare function createPublicationOne<A extends any[], T>(name: string, queryBuilder: QueryBuilder<A, T>): Publication<A, T>;
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
export declare function ServerPublishMany<A extends any[], T>(name: string, publisher: (this: Pick<Subscription, "userId">, ...args: A) => Mongo.Cursor<T>): Publication<A, T[]>;
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
export declare function ServerPublishMany<A extends any[], T>(name: string, publisher: (this: Subscription, ...args: A) => Promise<Mongo.Cursor<T>> | Mongo.Cursor<T> | undefined, queryBuilder: QueryBuilder<A, Mongo.Cursor<T>>): Publication<A, T[]>;
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
export declare function ServerPublishOne<A extends any[], T>(name: string, publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T>, queryBuilder: QueryBuilder<A, T>): Publication<A, T>;
export {};
