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
      Meteor.call(method, ...params, (err: any, result: unknown) => {
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

Cypress.Commands.add("logout", () => {
  cy.getMeteor().then((Meteor) => {
    Cypress.log({
      name: "logout",
    });

    return new Cypress.Promise((resolve, reject) => {
      Meteor.logout((err: any, result: unknown) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  });
});

Cypress.Commands.add("login", (username, password = "greg") => {
  cy.getMeteor().then((Meteor) => {
    // Logout first if the user is already logged in

    if (Meteor.userId()) {
      cy.logout();
    }

    Cypress.log({
      name: "login",
      consoleProps: () => ({ username }),
    });

    return new Cypress.Promise((resolve, reject) => {
      Meteor.loginWithPassword(username, password, (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
  cy.getMeteor().invoke("user").should("exist").and("not.be.null");
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
      cy.logout();
      localStorage.setItem("locale", state?.locale ?? "de");
      localStorage.setItem("region", state?.region ?? "all");
    }

    cy.allSubscriptionsReady();
  },
);

// add types

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject = any, T = any> {
      getById(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<JQuery<HTMLElement>>;
      getMeteor(): Chainable<any>;
      allSubscriptionsReady(options?: Partial<Loggable & Timeoutable>): Chainable<boolean>;
      callMethod<T = any>(method: string, ...params: any[]): Chainable<T>;
      logout(): Chainable<void>;
      login(username: string, password?: string): Chainable<void>;
      visitOpenki(
        url?: string,
        state?:
          | { locale?: string | undefined; region?: string | undefined }
          | { username: string; password?: string | undefined },
      ): Chainable<void>;
    }
  }
}

// handle as module
export {};
