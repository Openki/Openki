import { Meteor, Subscription } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
export type Record<T extends readonly Mongo.Cursor<any>[]> = Mongo.Cursor<any> | [...T] | undefined;
export type QueryBuilder<A extends any[], T> = (this: {
    userId: ReturnType<(typeof Meteor)["userId"]>;
}, ...args: A) => T;
export declare function publish<A extends any[], C extends readonly Mongo.Cursor<any>[], T extends Record<C>>(name: string, publisher: (this: Subscription, ...args: A) => Promise<T> | T | undefined): void;
export declare function removeCallback<A extends any[]>(args: A): A[number][];
export declare function getStack(): string | undefined;
