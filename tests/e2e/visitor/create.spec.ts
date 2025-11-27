beforeEach(() => {
  cy.visitOpenki("/event/2c50c4c7c5");
});

describe("Visitor", () => {
  it("should be able to rsvp a event", () => {
    cy.get("#maincontent button.btn-event").click();
    cy.get("#events-display-registration").click();
    cy.get("#acctount-tasks-login-frame-visitor").click();
    cy.get("#visitor-frame-username").type("no name");
    cy.get("#visitor-frame-email").type("no-name@openki.example");
    cy.get("#visitor-frame-submit").click();
    cy.get(".alert-success").should("be.visible");

    // clean up
    cy.get('[data-test="navbar-login-button"]').click();
    cy.get('#bs-navbar-collapse a[href="/profile"]').click();
    cy.get("#delete-confirm-confirmDelete").click();
    cy.get("#maincontent button.btn-danger").click();
  });
});
