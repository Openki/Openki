declare module "meteor/iron:router" {
  /**
   * A router that works on the server and the browser, designed specifically for Meteor.
   * Doc based on https://iron-meteor.github.io/iron-router/
   * Only Route Options is documented here to descrip route.
   */
  namespace Router {
    interface RouteThis {
      params: Record<string, string | undefined> & {
        query: Record<string, string | undefined | never>;
      };
    }
    interface HookThis<D> extends RouteThis {
      data(): D;
      next(): void;
    }

    interface RouteOptions<D> {
      /**
       * The name of the route.
       * Used to reference the route in path helpers and to find a default template
       * for the route if none is provided in the `"template"` option. If no name is
       * provided, the router guesses a name based on the path `'/post/:_id'`
       */
      name?: string;

      /**
       * To support legacy versions of `Iron.Router` you can provide an explicit path
       * as an option, in case the first parameter is actually a route name.
       * However, it is recommended to provide the path as the first parameter of the
       * route function.
       * @deprecated
       */
      path?: string;

      /**
       * If the template name is different from the route name you can specify it
       * explicitly here.
       */
      template?: string;

      /**
       * A layout template to be used with this route.
       * If there is no layout provided, a default layout will
       * be used.
       */
      layoutTemplate?: string;

      /**
       * A declarative way of providing templates for each yield region
       * in the layout
       */
      yieldRegions?: Record<string, { to: string }>;

      /**
       * this template will be rendered until the subscriptions from `waitOn` are ready
       */
      loadingTemplate?: string;

      /**
       * Subscriptions or other things we want to "wait" on. This also
       * automatically uses the loading hook.
       */
      waitOn?: (
        this: RouteThis,
      ) =>
        | Meteor.SubscriptionHandle
        | (() => boolean)
        | (Meteor.SubscriptionHandle | (() => boolean))[];

      notFoundTemplate?: string;

      /**
       * A data function that can be used to automatically set the data context for
       * our layout. This function can also be used by hooks and plugins. For
       * example, the "dataNotFound" plugin calls this function to see if it
       * returns a null value, and if so, renders the not found template.
       */
      data?: (this: RouteThis) => D;

      /**
       * Called when the route is first run. It is not called again if the route reruns
       * because of a computation invalidation. This makes it a good candidate for things
       * like analytics where you want be sure the hook only runs once. Note that this
       * hook won't run again if the route is reloaded via hot code push. You must call
       * `this.next()` to continue calling the next function.
       */
      onRun?: (this: HookThis<D>) => void;
      /**
       * Called if the route reruns because its computation is invalidated. Similarly to
       * `onBeforeAction`, if you want to continue calling the next function, you must
       * call `this.next()`.
       */
      onRerun?: (this: HookThis<D>) => void;
      /**
       * Called before the route or "action" function is run. These hooks behave
       * specially. If you want to continue calling the next function you must call
       * `this.next()`. If you don't, downstream `onBeforeAction` hooks and your action
       * function will not be called.
       */
      onBeforeAction?: (this: HookThis<D>) => void;
      /**
       * Called after your route/action function has run or had a chance to run. These
       * hooks behave like normal hooks and you don't need to call `this.next()` to move
       * from one to the next.
       */
      onAfterAction?: (this: RouteThis & { data(): D }) => void;
      /**
       * Called when the route is stopped, typically right before a new route is run.
       */
      onStop?: (this: RouteThis & { data(): D }) => void;

      /**
       * The same thing as providing a function as the second parameter. You can
       * also provide a string action name here which will be looked up on a Controller
       * when the route runs. Note, the action function
       * is optional. By default a route will render its template, layout and
       * regions automatically.
       * Example:
       * `action: 'myActionFunction'`
       */
      action?: (
        this: RouteThis<P, Q> & {
          response: any;
          redirect: (
            urlOrRouteName: string,
            params?: Record<string, any>,
            options?: {
              query?: string | Record<string, any>;
              hash?: string;
            },
          ) => void;
          render: (templateName?: string) => void;
        } & T,
      ) => void;

      /**
       * The `where: 'server'` option tells the Router this is a server side route.
       */
      where?: "server";
    }
    function route<D>(pathOrRouteName: string, options: RouteOptions<D>): void;

    /**
     * Return a fully qualified url for the route, given a set of parmeters and
     * options like hash and query.
     */
    function url(
      routeName: string,
      params?: Record<string, any>,
      options?: {
        query?: string | Record<string, any>;
        hash?: string;
      },
    ): string;

    /**
     * Returns a relative path given a route name, data context and optional query
     * and hash parameters.
     */
    function path(
      routeName: string,
      params?: Record<string, any>,
      options?: {
        query?: string | Record<string, any>;
        hash?: string;
      },
    ): string;

    function go(
      urlOrRouteName: string,
      params?: Record<string, any>,
      options?: {
        query?: string | Record<string, any>;
        hash?: string;
        replaceState?: boolean;
      },
    ): void;

    function current(): {
      params: Record<string, string | undefined> & {
        query: Record<string, string | undefined | never>;
        hash: string | null;
      };
      route: { getName(): string; options: { template: string } };
      url: string;
    };

    /**
     * Called before the route or "action" function is run. These hooks behave
     * specially. If you want to continue calling the next function you must call
     * `this.next()`. If you don't, downstream `onBeforeAction` hooks and your action
     * function will not be called.
     */
    function onBeforeAction(hook: string | ((this: { next: () => void }) => void)): void;
    /**
     * Called after your route/action function has run or had a chance to run. These
     * hooks behave like normal hooks and you don't need to call `this.next()` to move
     * from one to the next.
     */
    function onAfterAction(hook: () => void): void;

    /**
     * Called when the route is stopped, typically right before a new route is run.
     */
    function onStop(hook: () => void): void;

    function configure(options: {
      layoutTemplate?: string;
      notFoundTemplate?: string;
      loadingTemplate?: string;
    }): void;
  }
}

declare namespace Iron {
  const Location: any;
}
