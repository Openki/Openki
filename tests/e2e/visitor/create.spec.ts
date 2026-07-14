beforeEach(() => {
  // NOTE: The event URL might not be reliable since events in the testdata get regenerated
  // from time to time.
  //
  // If this test fails in the future again, we could consider navigating to
  // `cy.visitOpenki("/calendar")` and then click the first available event, trying to reserve a seat
  // or navigating back and trying the next event until we find an event which has registrations enabled
  cy.visitOpenki("/event/eb386e8309/Schweissen", { region: "" });
});

describe("Visitor", () => {
  it("should be able to RSVP to an event", () => {
    cy.get("#register-panel-reserve").click();
    cy.get("#events-display-registration").click();
    cy.get("#account-tasks-login-frame-visitor").click();
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
