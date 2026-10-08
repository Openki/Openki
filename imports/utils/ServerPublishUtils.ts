import { Meteor, Subscription } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export type Record<T extends readonly Mongo.Cursor<any>[]> = Mongo.Cursor<any> | [...T] | undefined;

export type QueryBuilder<A extends any[], T> = (
  this: { userId: ReturnType<(typeof Meteor)["userId"]> },
  ...args: A
) => T;

export function publish<
  A extends any[],
  C extends readonly Mongo.Cursor<any>[],
  T extends Record<C>,
>(name: string, publisher: (this: Subscription, ...args: A) => Promise<T> | T | undefined) {
  if (Meteor.isServer) {
    // on the server register the publisher / publish the record set
    // wrap the call to handle options
    Meteor.publish(name, async function (...args) {
      // everyting is okay, do the work
      const result = await publisher.call(this, ...args);
      if (result === undefined) {
        this.ready();
      }
      return result;
    });
  }
}

export function removeCallback<A extends any[]>(args: A) {
  const result = [...args];
  if (result.length) {
    const lastParam = result.at(-1);
    if (
      lastParam &&
      (typeof lastParam === "function" ||
        [lastParam.onReady, lastParam.onStop].some((f) => typeof f === "function"))
    ) {
      result.pop();
    }
  }
  return result;
}
