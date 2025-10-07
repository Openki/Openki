describe("Navbar", () => {
  context("default resolution", () => {
    beforeEach(() => {
      cy.visitOpenki("/");
    });

    it("should support login & logout", function () {
      cy.get(".loginButton").click();
      cy.get('[data-test="account-tasks-login-frame-username"]').clear();
      cy.get('[data-test="account-tasks-login-frame-username"]').type("Seee");
      cy.get('[data-test="account-tasks-login-frame-password"]').clear();
      cy.get('[data-test="account-tasks-login-frame-password"]').type("greg");
      cy.get('[data-test="account-tasks-login-frame-password"]').clear();
      cy.get('[data-test="account-tasks-login-frame-submit"]').click();
      cy.get('[data-test="account-tasks-login-frame-password"]').type("greg{enter}");
      cy.get(".loginButton").should("contain.text", "Seee");

      //logout
      cy.get("#bs-navbar-collapse .loginButton").click();
      cy.get("#bs-navbar-collapse button.btn").click();
      cy.get("#bs-navbar-collapse .loginButton").should("contains.text", "Log in/register");
    });

    it("should support show more region", function () {
      // Open the region selection dropdown
      cy.get('[data-test="region-selection-display"] .nav-link').click();

      // Count list items before clicking "Show more"
      cy.get('[data-test="region-selection-item"]')
        .its("length")
        .then((initialCount) => {
          // Click "Show more"
          cy.get('[data-test="regions-selection-show-more"]').click();

          // Verify the number of list items increased
          cy.get('[data-test="region-selection-item"]').its("length").should("be.gt", initialCount);
        });
    });
  });

  context("samsung-s10 resolution", () => {
    beforeEach(() => {
      cy.viewport("samsung-s10");
      cy.visitOpenki("/");
    });

    it("should support login & logout", function () {
      cy.get("#topBar .fa-bars").click();
      cy.get(".loginButton").click();
      cy.get('[data-test="account-tasks-login-frame-username"]').clear();
      cy.get('[data-test="account-tasks-login-frame-username"]').type("Seee");
      cy.get('[data-test="account-tasks-login-frame-password"]').clear();
      cy.get('[data-test="account-tasks-login-frame-password"]').type("greg");
      cy.get('[data-test="account-tasks-login-frame-password"]').clear();
      cy.get('[data-test="account-tasks-login-frame-submit"]').click();
      cy.get('[data-test="account-tasks-login-frame-password"]').type("greg{enter}");
      cy.get(".loginButton").should("contain.text", "Seee");

      //logout
      cy.get("#topBar .fa-bars").click();
      cy.get("#bs-navbar-collapse .loginButton").click();
      cy.get("#bs-navbar-collapse button.btn").click();
      cy.get("#bs-navbar-collapse .loginButton").should("contains.text", "Log in/register");
    });

    it("should support show more region", function () {
      cy.get("#topBar .fa-bars").click();
      // Open the region selection dropdown
      cy.get('[data-test="region-selection-display"] .nav-link').click();

      // Count list items before clicking "Show more"
      cy.get('[data-test="region-selection-item"]')
        .its("length")
        .then((initialCount) => {
          // Click "Show more"
          cy.get('[data-test="regions-selection-show-more"]').click();

          // Verify the number of list items increased
          cy.get('[data-test="region-selection-item"]').its("length").should("be.gt", initialCount);
        });
    });
  });
});
