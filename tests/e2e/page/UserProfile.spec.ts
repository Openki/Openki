beforeEach(() => {
  cy.visitOpenki("/user/BNwqJW939Jo9d7HLN");
});

describe("userprofile page", () => {
  it("should be navigable", () => {
    cy.get("h1").should("be.visible");
  });

  it('should allow admins to set and unset "User has contributed"', async () => {
    cy.getById("user-has-contributed-button").should("not.exist");

    cy.login("greg");

    cy.getById("user-has-contributed-button").should("be.visible").click();

    cy.getById("contribution").should("be.visible");

    cy.getById("user-has-contributed-button").should("be.visible").click();

    cy.getById("contribution").should("not.exist");
  });

  it("should allow to send a direct message", function () {
    cy.get('[data-test="send-message-textarea"]').type(
      "Hallo Sandro, es freut mich dich am Freitag zu sehen. Gruss Seee",
    );
    cy.get('[data-test="send-message-submit"]').click();

    cy.get('[data-test="account-tasks-login-frame-username"]').type("Seee");
    cy.get('[data-test="account-tasks-login-frame-password"]').click();
    cy.get('[data-test="account-tasks-login-frame-password"]').type("greg");
    cy.get('[data-test="account-tasks-login-frame-submit"]').click();

    cy.get(".alert-success").should("be.visible");
  });
});
