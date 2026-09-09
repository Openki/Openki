import { Subscription } from "meteor/meteor";
import { EJSON } from "meteor/ejson";
import { Mongo } from "meteor/mongo";
import { useUserId } from "./react-meteor-data";
import { isObject } from "lodash-es";
import { useFind, useSubscribe, useTracker } from "meteor/react-meteor-data";

import { publish, QueryBuilder } from "./ServerPublishUtils";
import { getStack } from "/imports/utils/getStack";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]> | undefined | null;
    }
  : T;

/**
 * Subscribe to the record set.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare function publication<A extends any[], T>(...args: A): [isLoading: () => boolean, data: T];
/**
 * Subsribe to the record set, when the condition is true.
 * @param condition true: date get loaded; false: none date get loaded, isLoading() will always return false
 */
declare function publication<A extends any[], T>(
  condition: { when: boolean },
  ...args: DeepPartial<A>
): [isLoading: () => boolean, data: T | undefined];

export type Publication<A extends any[], T> = typeof publication<A, T>;

export function createPublicationMany<A extends any[], T>(
  name: string,
  queryBuilder: QueryBuilder<A, Mongo.Cursor<T, T>>,
) {
  return function (...args: any[]) {
    const hasCondition = isObject(args[0]) && "when" in args[0];

    if (Meteor.isDevelopment && Meteor.isClient) {
      console.debug(`useSubscribe("${name}", ${JSON.stringify(args)})`, {
        hasCondition,
        ...(hasCondition ? { when: !args[0].when } : {}),
        stack: { full: getStack() },
      });
    }

    // add error logging on client
    const handleCallback = {
      onStop: (error?: Error) => {
        if (error) {
          // An error occurs on the server during execution on the server side.
          console.debug(
            `%cError on useSubscribe("${name}", ${JSON.stringify(args)})`,
            { hasCondition, ...(hasCondition ? { when: !args[0].when } : {}) },
            "color: red",
          );
          console.error(error);
        }
      },
    };

    const isLoading = useSubscribe(
      // support conditionally subscribe:
      // https://docs.meteor.com/packages/react-meteor-data#usesubscribe-subname-args
      hasCondition && !args[0].when ? "" : name,
      ...(hasCondition ? args.slice(0, 1) : args),
      handleCallback,
    );
    const userId = useUserId();
    return [
      isLoading,
      useFind(() => {
        if (hasCondition && !args[0].when) {
          // return undefined when condition is false
          return undefined;
        }
        try {
          return queryBuilder.call({ userId }, ...(hasCondition ? args.slice(0, 1) : args));
        } catch (error) {
          // An error occurs on the server during execution on the server side.
          console.debug(`%cError in ${name}(${JSON.stringify(args)})`, "color: red");
          console.error(error);
          throw error;
        }
      }, [EJSON.stringify(args as any), userId]),
    ];
  } as Publication<A, T>;
}

export function createPublicationOne<A extends any[], T>(
  name: string,
  queryBuilder: QueryBuilder<A, T>,
): Publication<A, T> {
  return function (...args: any[]) {
    const hasCondition = isObject(args[0]) && "when" in args[0];

    if (Meteor.isDevelopment && Meteor.isClient) {
      console.debug(`useSubscribe("${name}", ${JSON.stringify(args)})`, {
        hasCondition,
        ...(hasCondition ? { when: !args[0].when } : {}),
        stack: { full: getStack() },
      });
    }

    // add error logging on client
    const handleCallback = {
      onStop: (error?: Error) => {
        if (error) {
          // An error occurs on the server during execution on the server side.
          console.debug(
            `%cError on useSubscribe("${name}", ${JSON.stringify(args)})`,
            {
              hasCondition,
              ...(hasCondition ? { when: !args[0].when } : {}),
            },
            "color: red",
          );
          console.error(error);
        }
      },
    };

    const isLoading = useSubscribe(
      // support conditionally subscribe:
      // https://docs.meteor.com/packages/react-meteor-data#usesubscribe-subname-args
      hasCondition && !args[0].when ? "" : name,
      ...(hasCondition ? args.slice(0, 1) : args),
      handleCallback,
    );
    const userId = useUserId();
    return [
      isLoading,
      useTracker(() => {
        if (hasCondition && !args[0].when) {
          // return undefined when condition is false to conditionally call the
          // find method: https://docs.meteor.com/packages/react-meteor-data#usefind-cursorfactory-deps
          return undefined;
        }

        try {
          return queryBuilder.call({ userId }, ...(hasCondition ? args.slice(0, 1) : args));
        } catch (error) {
          // An error occurs on the server during execution on the server side.
          console.debug(`%cError in ${name}(${JSON.stringify(args)})`, "color: red");
          console.error(error);
          throw error;
        }
      }, [EJSON.stringify(args as any), userId]),
    ];
  } as Publication<A, T>;
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
