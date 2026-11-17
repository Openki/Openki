import { Meteor, Subscription } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Record, QueryBuilder } from "./ServerPublishUtils";
export interface Subscriber {
    subscribe(name: string, ...args: any[]): Meteor.SubscriptionHandle;
}
export interface SubscriptionHandle<T> {
    /** Query the loaded data. */
    (): Promise<T>;
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
export declare function createPublication<A extends any[], T>(name: string, queryBuilder: QueryBuilder<A, T>): Publication<A, T>;
export type SubscriptionType<P extends Publication<A, T>, A extends any[] = any, T = any> = ReturnType<P["subscribe"]>;
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
export declare function ServerPublish<A extends any[], C extends readonly Mongo.Cursor<any>[], T extends Record<C>>(name: string, publisher: (this: Pick<Subscription, "userId">, ...args: A) => T): Publication<A, T>;
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
export declare function ServerPublish<A extends any[], C extends readonly Mongo.Cursor<any>[], T extends Promise<Record<C>> | Record<C>, Q>(name: string, publisher: (this: Subscription, ...args: A) => T | undefined, queryBuilder: QueryBuilder<A, Q>): Publication<A, Q>;
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
export declare function ServerPublishMany<A extends any[], T extends Mongo.Cursor<any>>(name: string, publisher: (this: Pick<Subscription, "userId">, ...args: A) => T): Publication<A, T>;
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
export declare function ServerPublishMany<A extends any[], T>(name: string, publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T> | undefined, queryBuilder: QueryBuilder<A, T>): Publication<A, T>;
export declare function ServerPublishOne<A extends any[], T>(name: string, publisher: (this: Subscription, ...args: A) => Mongo.Cursor<T>, queryBuilder: QueryBuilder<A, T>): Publication<A, T>;
