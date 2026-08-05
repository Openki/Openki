import { promisify } from "es6-promisify";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Tracker } from "meteor/tracker";
import { Promise } from "meteor/promise";

promisify.Promise = Promise;

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit async/await.
 */
export const MeteorAsync = {
  subscribe:
    Meteor.subscribe &&
    (function () {
      return (name: string, ...args: unknown[]) =>
        new Promise<Meteor.SubscriptionHandle>((resolve, reject) => {
          const handle = Meteor.subscribe(name, ...args, {
            onReady: () => {
              resolve(handle);
            },
            onStop: (err: unknown) => {
              if (err) {
                reject(err);
              }
            },
          });
        });
    })(),
  setTimeout:
    Meteor.setTimeout &&
    ((delay: number) =>
      new Promise((resolve) => {
        Meteor.setTimeout(resolve, delay);
      })),
  /** Defer execution of a function to run asynchronously in the background (similar to `MeteorAsync.delay(func, 0)`. */
  defer:
    Meteor.defer &&
    (() =>
      new Promise((resolve) => {
        Meteor.defer(resolve);
      })),
};

/**
 * This contains some async/Promise wrapper for existing meteor function,
 * so those can be used mit async/await.
 */
export const AccountsAsync = {
  changePassword: Accounts.changePassword && promisify(Accounts.changePassword),
  forgotPassword: Accounts.forgotPassword && promisify(Accounts.forgotPassword),
  resetPassword: Accounts.resetPassword && promisify(Accounts.resetPassword),
};

export const TrackerAsync = {
  /**
   * `Tracker.afterFlush` runs code when all consequent of a tracker based change (such as a route
   * change) have occurred.
   * Source: https://guide.meteor.com/testing.html#full-app-integration-test
   */
  afterFlush: Tracker.afterFlush && promisify(Tracker.afterFlush),
};
