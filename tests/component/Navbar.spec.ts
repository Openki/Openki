// file://./../../imports/ui/components/navbar/index.ts

describe("Navbar", () => {
  context("default resolution", () => {
    beforeEach(() => {
      cy.visitOpenki("/");
    });

    it("should support login & logout", function () {
      cy.get('[data-test="navbar-login-button"]').click();
      cy.get("#account-tasks-login-frame-username").clear();
      cy.get("#account-tasks-login-frame-username").type("Seee");
      cy.get("#account-tasks-login-frame-password").clear();
      cy.get("#account-tasks-login-frame-password").type("greg");
      cy.get("#account-tasks-login-frame-password").clear();
      cy.get("#account-tasks-login-frame-submit").click();
      cy.get("#account-tasks-login-frame-password").type("greg{enter}");
      cy.get('[data-test="navbar-login-button"]').should("contain.text", "Seee");

      //logout
      cy.get('[data-test="navbar-login-button"]').click();
      cy.get('[data-test="navbar-user-frame-logout-button"]').click();
      cy.get('[data-test="navbar-login-button"] i').should("have.class", "fa-right-to-bracket");
    });

    it("should support show more region", function () {
      // Open the region selection dropdown
      cy.get('[data-test="region-select-display"] .nav-link').click();

      // Count list items before clicking "Show more"
      cy.get('[data-test="region-select-option"]')
        .its("length")
        .then((initialCount) => {
          // Click "Show more"
          cy.get('[data-test="region-select-show-more"]').click();

          // Verify the number of list items increased
          cy.get('[data-test="region-select-option"]').its("length").should("be.gt", initialCount);
        });
    });
  });

  context("samsung-s10 resolution", () => {
    beforeEach(() => {
      cy.viewport("samsung-s10");
      cy.visitOpenki("/");
    });

    it("should support login & logout", function () {
      cy.get('[data-test="navbar-toggler"] i.fa-bars').click();
      cy.get('[data-test="navbar-login-button"]').click();
      cy.get("#account-tasks-login-frame-username").type("Seee");
      cy.get("#account-tasks-login-frame-password").click();
      cy.get("#account-tasks-login-frame-password").type("greg");
      cy.get("#account-tasks-login-frame-submit").click();
      cy.get(".navbar-collapse")
        .should("not.have.class", "show")
        .should("not.have.class", "collapsing");
      cy.get('[data-test="navbar-toggler"] i.fa-bars').should("be.visible").click();
      cy.get('[data-test="navbar-login-button"]').should("have.text", " Seee");
      cy.get('[data-test="navbar-login-button"]').click();
      // Very important to wait here and let the UI re-render before we log out.
      // Otherwise, this test fails due to a timing issue: The menu would get _opened_ after the menu was _closed_ by the logout.
      // NOTE: When removing Bootstrap and using a purely declarative UI, this will hopefully work more reliably.
      cy.wait(200);
      cy.get('[data-test="navbar-user-frame-logout-button"]').click();
      cy.get(".navbar-collapse")
        .should("not.have.class", "show")
        .should("not.have.class", "collapsing");
      cy.get('[data-test="navbar-toggler"] i.fa-bars').should("be.visible").click();
      cy.get('[data-test="navbar-login-button"] i').should("have.class", "fa-right-to-bracket");
    });

    it("should support show more region", function () {
      cy.get('[data-test="navbar-toggler"]').click();
      // Open the region selection dropdown
      cy.get('[data-test="region-select-display"] .nav-link').click();

      // Count list items before clicking "Show more"
      cy.get('[data-test="region-select-option"]')
        .its("length")
        .then((initialCount) => {
          // Click "Show more"
          cy.get('[data-test="region-select-show-more"]').click();

          // Verify the number of list items increased
          cy.get('[data-test="region-select-option"]').its("length").should("be.gt", initialCount);
        });
    });
  });
});
