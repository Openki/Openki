// file://./../../../imports/ui/pages/event-details/index.tsx

describe("event details page", () => {
  //  https://gitlab.com/Openki/Openki/-/issues/2269
  it("should allow to cancel a event", () => {
    cy.visitOpenki("/event/eb386e8309/Schweissen", { username: "Support" });

    cy.getById("events-participants-header").should("contains.text", "Noch keine Teilnehmer_innen");
    cy.get("#maincontent .btn-remove").click();
    cy.get("#maincontent .event-cancel-confirm p").should(
      "have.text",
      'Bitte bestätige das Absagen von dieser Veranstaltung. Sie wird dann als "Abgesagt" dargestellt und die Anmeldefunktion wird deaktiviert.\nDa niemand angemeldet ist, wird niemand benachrichtigt.',
    );
    cy.get("#events-cancel-confirm-dialog-cancel").click();
    cy.getById("event-details-canceled").should("be.visible");
    cy.get("#events-display-body-uncancel-button").click();
    cy.get(".alert-success").should("be.visible");
  });

  // https://gitlab.com/Openki/Openki/-/issues/2228
  it("should display not found page for not existing events", () => {
    cy.visitOpenki("/event/not-exists", { username: "Seee" });

    cy.get("h3").contains("Diese Veranstaltung konnte nicht gefunden werden.");
  });
});
