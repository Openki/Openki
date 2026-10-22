beforeEach(() => {
  cy.visitOpenki("/event/zE2qmKMsBxtJmgrJq", { username: "Roze" });
});

describe("Events Participants", () => {
  it("team can send e-mail to all participants", function () {
    cy.get("#events-participants-notify-all").click();
    cy.get("#send-message-textarea").type(
      "Hallo Zusammen, viel Spass bei euren eigenen Erkundungen. Alles Gute",
    );
    cy.get("#send-message-submit").click();
    cy.get(".alert-success").should("be.visible");
  });
});
