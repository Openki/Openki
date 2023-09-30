import { Router } from "meteor/iron:router";
import { ReactiveVar } from "meteor/reactive-var";

import { SubscriptionHandle } from "/imports/utils/ServerPublishBlaze";

// Extends the route function to support async await in onRun

export function route<D, S extends Record<string, SubscriptionHandle<any>> | undefined>(
  pathOrRouteName: string,
  options: Omit<Router.RouteOptions<D>, "data"> & {
    onRun?: () => Promise<unknown>;
    subscriptions: (this: Router.RouteThis) => S;
    data?: (
      this: Router.RouteThis & {
        subscriptions: (this: Router.RouteThis) => S;
      }
    ) => D;
  }
): void;
export function route<D>(
  pathOrRouteName: string,
  options: Omit<Router.RouteOptions<D>, "data"> & {
    onRun?: () => Promise<unknown>;
  }
): void;
export function route<D>(
  pathOrRouteName: string,
  options: Omit<Router.RouteOptions<D>, "data"> & {
    onRun?: () => Promise<unknown>;
    data: (this: Router.RouteThis) => D;
  }
): void;
export function route<D, S extends Record<string, SubscriptionHandle<any>> | undefined>(
  pathOrRouteName: string,
  options: Omit<Router.RouteOptions<D>, "data"> & {
    onRun?: () => Promise<unknown>;
    subscriptions?: (this: Router.RouteThis) => S;
    data?: (
      this: Router.RouteThis & {
        subscriptions: (this: Router.RouteThis) => S;
      }
    ) => D;
  }
) {
  const subscriptions = options.subscriptions;
  // eslint-disable-next-line no-param-reassign
  delete options.subscriptions;

  if (subscriptions && options.waitOn) {
    throw new Error("not supported");
  }

  if (subscriptions) {
    // eslint-disable-next-line no-param-reassign
    options.waitOn = function () {
      return Object.values(subscriptions.call(this)).map(
        (s) => () => (s as SubscriptionHandle<any>).isLoading()
      );
    };

    const data = options.data;
    if (data) {
      // eslint-disable-next-line no-param-reassign
      options.data = function () {
        this.subscriptions = () => subscriptions.call(this);
        try {
          return data?.call(this);
        } finally {
          delete (this as any).subscriptions;
        }
      };
    }
  }

  if (!options.onRun) {
    Router.route(pathOrRouteName, options as any);
    return;
  }

  const onRunOption = options.onRun;
  // eslint-disable-next-line no-param-reassign
  delete options.onRun;

  const waitOn = options.waitOn;
  // eslint-disable-next-line no-param-reassign
  delete options.waitOn;

  const onRunAwaited = new ReactiveVar<boolean>(false);
  const newOptions = {
    onRun() {
      onRunOption?.().then(() => {
        onRunAwaited.set(true);
      });
      (this as any).next();
    },
    waitOn: waitOn
      ? function () {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const waitOnResult = waitOn.call(this);

          if (Array.isArray(waitOnResult)) {
            return [
              ...waitOnResult,
              function () {
                return onRunAwaited.get();
              },
            ];
          }

          return [
            waitOnResult,
            function () {
              return onRunAwaited.get();
            },
          ];
        }
      : function () {
          return function () {
            return onRunAwaited.get();
          };
        },
    ...options,
  } as Router.RouteOptions<D>;

  Router.route(pathOrRouteName, newOptions);
}
