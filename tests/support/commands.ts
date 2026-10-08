// Custom Cypress Commands für Meteor from https://blog.meteor.com/testing-a-meteor-app-with-cypress-bfb3d3c6ed6f

// Get DOM elements by id. this command adds the prefix "data-test".
Cypress.Commands.add("getById", (selector, ...args) => {
  cy.get(`[data-test=${selector}]`, ...args);
});

// Returns a Meteor instance from the browser.
Cypress.Commands.add("getMeteor", () =>
  cy.window({ log: false }).then(({ Meteor }) => {
    if (!Meteor) {
      // When trying to access the `window` object before “visiting” a page in a
      // test, we get an `undefined` value. Therefore, the `Meteor` object is
      // undefined. We visit the app so that we get the Window instance of the
      // app from which we get the `Meteor` instance used in tests
      cy.visit("/", { log: false });
      return cy.window({ log: false }).then(({ Meteor: MeteorSecondTry }) => MeteorSecondTry);
    }
    return Meteor;
  }),
);

// Check if the meteor subscriptions are ready, should equal true.
Cypress.Commands.add("allSubscriptionsReady", () => {
  cy.window({ log: false }).then((win) => {
    new Cypress.Promise((resolve) => {
      const poll = setInterval(() => {
        if (win.DDP?._allSubscriptionsReady()) {
          clearInterval(poll);
          resolve();
        }
      }, 200);
    });
  });
});

// Calls a Meteor method.
Cypress.Commands.add("callMethod", (method: string, ...params: any[]) => {
  return cy.getMeteor().then((Meteor) => {
    Cypress.log({
      name: "callMethod",
      consoleProps: () => ({ name: method, params }),
    });

    return new Cypress.Promise((resolve, reject) => {
      Meteor.call(method, ...params, (err: unknown, result: unknown) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`%c${method}`, "color: red; font-style: italic;", result);
        resolve(result);
      });
    });
  });
});
Cypress.Commands.add("expectCallMethodThrowsError", (method: string, ...params: any[]) => {
  return cy.getMeteor().then((Meteor) => {
    Cypress.log({
      name: "expectCallMethodThrowsError",
      consoleProps: () => ({ name: method, params }),
    });

    return new Cypress.Promise((resolve, reject) => {
      Meteor.call(method, ...params, (err: unknown) => {
        console.log(`%c${method}`, "color: red; font-style: italic;", err);
        if (err) {
          resolve(err);
          return;
        }
        reject(new Error(`Expected ${method} to fail`));
      });
    });
  });
});

Cypress.Commands.add("logout", () => {
  cy.getMeteor().then((Meteor) => {
    Cypress.log({
      name: "logout",
    });

    return new Cypress.Promise((resolve, reject) => {
      Meteor.logout((err: unknown) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
});

Cypress.Commands.add("login", (username: string, password = "greg") => {
  cy.getMeteor()
    .then((Meteor) => {
      const doLogin = () => {
        Cypress.log({
          name: "login",
          consoleProps: () => ({ username }),
        });

        return new Cypress.Promise((resolve, reject) => {
          Meteor.loginWithPassword(username, password, (err: unknown) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      };

      // Logout first if user is already logged in
      if (Meteor.userId()) {
        return cy.logout().then(() => doLogin());
      } else {
        return doLogin();
      }
    })
    .then(() => {
      // Ensure user is logged in
      cy.getMeteor().invoke("user").should("exist").and("not.be.null");
    });
});

Cypress.Commands.add(
  "visitOpenki",
  (
    url = "/",
    state?:
      | { locale?: string | undefined; region?: string | undefined }
      | { username: string; password?: string | undefined },
  ) => {
    cy.visit(url);

    if (state && "username" in state) {
      cy.login(state.username, state.password);
    } else {
      cy.logout().then(() => {
        localStorage.setItem("locale", state?.locale ?? "en");
        localStorage.setItem("region", state?.region ?? "all");
      });
    }

    // Force reload to show the expected region select.
    cy.reload();
    cy.allSubscriptionsReady();
  },
);

Cypress.Commands.add("mount", (component: string, props: Record<string, any> = {}) => {
  cy.visit("/component/" + component, { qs: { args: JSON.stringify(props) } });
  cy.allSubscriptionsReady();
});

// add types

declare global {
  // oxlint-disable-next-line no-namespace
  namespace Cypress {
    interface Chainable<Subject = any, T = any> {
      getById(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<JQuery<HTMLElement>>;
      getMeteor(): Chainable<any>;
      allSubscriptionsReady(options?: Partial<Loggable & Timeoutable>): Chainable<boolean>;
      callMethod<T = any>(method: string, ...params: any[]): Chainable<T>;
      expectCallMethodThrowsError<T = any>(method: string, ...params: any[]): Chainable<T>;
      logout(): Chainable<void>;
      login(username: string, password?: string): Chainable<void>;
      visitOpenki(
        url?: string,
        state?:
          | { locale?: string | undefined; region?: string | undefined }
          | { username: string; password?: string | undefined },
      ): Chainable<void>;
      mount(component: string, props?: Record<string, any>): Chainable<void>;
    }
  }
}

// Mark this as an ES module
// oxlint-disable-next-line unicorn/require-module-specifiers
export {};
