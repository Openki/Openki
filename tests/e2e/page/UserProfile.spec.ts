// file://./../../../imports/ui/pages/userprofile/index.tsx

beforeEach(() => {
  // User ids are not static, so we need a little trick to find a user profile page
  cy.visitOpenki("/group/e49ed1ce5d/walliserduetsch-lernen");
  cy.get(".profilelink").contains("Sandro").click();
});

describe("userprofile page", () => {
  it("should be navigable", () => {
    cy.get("h1").should("be.visible");
  });

  it('should allow admins to set and unset "User has contributed"', () => {
    cy.getById("user-has-contributed-button").should("not.exist");

    cy.login("greg");

    cy.getById("user-has-contributed-button").should("be.visible").click();

    // Wait for the UI to re-render before continuing.
    // The likely cause in this case is because the `UserprofilePage` receives the `user` as a prop
    // but `iron:router` sometimes is not fast enough with updating the Page props
    // when the userHasContributed state changes inside component.
    //
    // NOTE: Once we replace `iron:router`, we should try to remove this artificial delay.
    cy.wait(4000);

    cy.getById("contribution").should("be.visible");

    cy.getById("user-has-contributed-button").should("be.visible").click();

    cy.getById("contribution").should("not.exist");
  });

  it("should allow to send a direct message", () => {
    cy.get("#send-message-textarea").should("be.disabled");

    cy.login("Seee");

    cy.get("#send-message-textarea").type(
      "Hallo Sandro, es freut mich dich am Freitag zu sehen. Gruss Seee",
    );
    cy.get("#send-message-submit").click();

    cy.get(".alert-success").should("be.visible");
  });
});
