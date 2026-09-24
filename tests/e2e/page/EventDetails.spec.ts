// file://./../../../imports/ui/pages/event-details/index.tsx

describe("event details page", () => {
  //  https://gitlab.com/Openki/Openki/-/issues/2269
  it("should allow to cancel a event", () => {
    cy.visitOpenki("/event/97383d129a/walliserdutsch-lernen", { username: "Support" });

    cy.getById("events-participants-header").should("contains.text", "Noch keine Teilnehmer_innen");
    cy.get("#maincontent .btn-remove").click();
    cy.get("#event-confirm-dialog-text").should("be.visible");
    cy.get("#events-cancel-confirm-dialog-cancel").click();
    cy.getById("event-details-canceled").should("be.visible");
    cy.get("#events-display-body-uncancel").click();
    cy.get(".alert-success").should("be.visible");
  });

  // https://gitlab.com/Openki/Openki/-/issues/2228
  it("should display not found page for not existing events", () => {
    cy.visitOpenki("/event/not-exists", { username: "Seee" });

    cy.get("h3").contains(
      "Could not find this event. Maybe it was deleted, or never existed in the first place.",
    );
  });
});
