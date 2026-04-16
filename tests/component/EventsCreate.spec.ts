// file://./../../imports/ui/components/events/edit/index.tsx

describe("event create", () => {
  it("should show region selection if none region set", () => {
    cy.visitOpenki("/event/create");
    cy.get("#event-edit-region").should("be.visible");
  });

  describe("should require a venue", () => {
    it("should show error message if the venue input is focused and left empty", () => {
      cy.visit("/event/create");

      cy.get("#event-edit-venue-search").click().blur();

      // Error message should be visible wafter blurring venue input without selecting a value
      cy.get("#event-edit-venue-search").should("have.class", "is-invalid");

      // Error message about missing venue should still be visible after clicking submit
      cy.get("#events-edit-save").click();
      cy.get("#event-edit-venue-search").should("have.class", "is-invalid");
    });
  });
});
