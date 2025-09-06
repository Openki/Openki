// Custom Cypress Commands für Meteor from https://blog.meteor.com/testing-a-meteor-app-with-cypress-bfb3d3c6ed6f

// Get DOM elements by id. this command adds the prefix "data-test".
Cypress.Commands.add("getById", (selector, ...args) => {
  cy.get(`[data-test=${selector}]`, ...args);
});

// Returns a Meteor instance from the browser.
Cypress.Commands.add("getMeteor", () =>
  cy.window().then(({ Meteor }) => {
    if (!Meteor) {
      // When trying to access the `window` object before “visiting” a page in a
      // test, we get an `undefined` value. Therefore, the `Meteor` object is
      // undefined. We visit the app so that we get the Window instance of the
      // app from which we get the `Meteor` instance used in tests
      cy.visit("/");
      return cy.window().then(({ Meteor: MeteorSecondTry }) => MeteorSecondTry);
    }
    return Meteor;
  }),
);

// Check if the meteor subscriptions are ready, should equal true.
Cypress.Commands.add("allSubscriptionsReady", (options = {}) => {
  const log = { name: "allSubscriptionsReady" };

  return cy.window({ log: false }).then((win) => {
    Cypress.log(log);

    return cy
      .wrap(null, { log: false })
      .then(() => win.DDP._allSubscriptionsReady())
      .should("eq", true, options);
  });
});

// Calls a Meteor method.
Cypress.Commands.add("callMethod", (method, ...params) => {
  Cypress.log({
    name: "Calling method",
    consoleProps: () => ({ name: method, params }),
  });

  cy.getMeteor().then((Meteor) => {
    return new Cypress.Promise((resolve, reject) => {
      Meteor.call(method, ...params, (err: any, result: unknown) => {
        if (err) {
          return reject(err);
        }
        console.log(`%c${method}`, "color: red; font-style: italic;", result);
        resolve(result);
      });
    });
  });
});

Cypress.Commands.add("logout", () => {
  Cypress.log({
    name: "Logging out",
  });

  cy.getMeteor().then(
    (Meteor) =>
      new Cypress.Promise((resolve, reject) => {
        Meteor.logout((err: any, result: unknown) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      }),
  );
});

Cypress.Commands.add("visitAndWaitForSubscriptions", (url) => {
  cy.visit(url);
  cy.allSubscriptionsReady().should("eq", true);
});

Cypress.Commands.add("login", (username = "user", password = "password") => {
  cy.getMeteor().then((Meteor) => {
    // Logout first if the user is already logged in
    const promise = Meteor.userId() ? cy.logout() : (Promise.resolve() as any);

    return promise.then(
      () =>
        new Cypress.Promise((resolve, reject) => {
          Meteor.loginWithPassword(username, password, (err: any) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        }),
    );
  });
  cy.getMeteor().invoke("user").should("exist").and("not.be.null");
});

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
      login(username?: string, password?: string): Chainable<void>;
      visitAndWaitForSubscriptions(url: string): Chainable<void>;
    }
  }
}

// handle as module
export {};
