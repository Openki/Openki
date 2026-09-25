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
      },
    ) => D;
  },
): void;
export function route<D>(
  pathOrRouteName: string,
  options:
    | (Omit<Router.RouteOptions<D>, "data"> & {
        onRun?: () => Promise<unknown>;
      })
    | {
        onRun?: () => Promise<unknown>;
        data: (this: Router.RouteThis) => D;
      },
): void;

export function route<D, S extends Record<string, SubscriptionHandle<any>> | undefined>(
  pathOrRouteName: string,
  options: Omit<Router.RouteOptions<D>, "data"> & {
    onRun?: () => Promise<unknown>;
    subscriptions?: (this: Router.RouteThis) => S;
    data?: (
      this: Router.RouteThis & {
        subscriptions: (this: Router.RouteThis) => S;
      },
    ) => D;
  },
) {
  const subscriptions = options.subscriptions;
  delete options.subscriptions;

  if (subscriptions && options.waitOn) {
    throw new Error("not supported");
  }

  if (subscriptions) {
    const data = options.data;
    let handlers: NonNullable<S>;

    // load data, remove async call, keep reactive
    let currentRequestId = "";
    const dataLoaded = new ReactiveVar(false);

    if (data) {
      options.data = function () {
        this.subscriptions = () => handlers;
        try {
          dataLoaded.set(true);
          return data.call(this);
        } finally {
          delete (this as any).subscriptions;
        }
      };
    } else {
      dataLoaded.set(true);
    }

    options.waitOn = function () {
      // prevent loading multiple times the same data;
      handlers = subscriptions.call(this);
      if (currentRequestId !== JSON.stringify(Object.entries(this.params))) {
        currentRequestId = JSON.stringify(Object.entries(this.params));

        // reset state of loading
        if (data) {
          dataLoaded.set(false);
        } else {
          dataLoaded.set(true);
        }
      }

      return Object.values(handlers).map((s) => () => {
        return !s.isLoading() && dataLoaded.get();
      });
    };

    const action = options.action;
    options.action = async function () {
      const data = await this.data();
      if (!data) {
        this.render(
          options.notFoundTemplate || (Router as any).configure().lookupNotFoundTemplate(),
        );
        return;
      }

      if (action) {
        action.call(this);
        return;
      }

      this.render();
    };
  }

  if (!options.onRun) {
    Router.route(pathOrRouteName, options as any);
    return;
  }

  const onRunOption = options.onRun;
  delete options.onRun;

  const waitOn = options.waitOn;
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
