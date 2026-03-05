import { Meteor } from "meteor/meteor";
import { serverError } from "../api/log/methods";
import { getStack } from "/imports/utils/getStack";

/**
 * Registers a function as a meteor method and makes it callable.
 * https://docs.meteor.com/api/methods.html
 *
 * This helps to make the method type safe and usable via a JS module.
 *
 * Inspired by the Advanced Method Boilerplate in the Meteor Guide.
 * https://guide.meteor.com/methods.html#advanced-boilerplate
 *
 * @param name Name of method.
 * @param run Function called on the server each time a client invokes it. Inside the function,
 * `this` is the method invocation handler object.
 * @returns A callable and typesafe function for the client, that returns a promise
 */
export function ServerMethod<T extends any[], R>(
  name: string,
  run: (this: Meteor.MethodThisType, ...args: T) => R | Promise<R>,
  options: {
    /**
     * When a method is called, it usually runs twice—once on the client to simulate the result
     * for Optimistic UI, and again on the server to make the actual change to the database.
     * Some methods can not simulated on the client (for example, if you didn’t load some data
     * on the client that the method needs to do the simulation properly). With
     * `{ simulation: false }` you can disable simulation in this case. Default is `true`
     */
    simulation: boolean;
  } = { simulation: true },
) {
  // register
  Meteor.methods({
    // wrap the call to handle options
    [name](...args) {
      // this runs on the server (and is simulated on the client)

      if (Meteor.isDevelopment && Meteor.isClient) {
        console.groupCollapsed(`Meteor.callAsync("${name}",${JSON.stringify(args)})`);
        console.debug(getStack());
        console.groupEnd();
      }

      if (Meteor.isClient && !options.simulation) {
        // do nothing on the client if simulation is deactivated
        return undefined;
      }

      try {
        // everything is okay, do the work
        return run.call(this, ...args);
      } catch (error) {
        if (Meteor.isServer) {
          // An error occurs on the server during execution on the server side.
          serverError(error);
        } else {
          // An error occurs on the client during execution on the client side.
          console.groupCollapsed(`%cError in ${name}(${JSON.stringify(args)})`, "color: red");
          console.error(error);
          console.groupEnd();
        }
        throw error;
      }
    },
  });

  // give back a callable and typesafe function for the client
  return ((...args: T) => Meteor.callAsync(name, ...args)) as (...args: T) => Promise<R>;
}
