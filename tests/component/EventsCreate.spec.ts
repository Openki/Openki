// file://./../../imports/ui/components/events/edit/index.tsx

describe("event create", () => {
  it("should show region selection if none region set", () => {
    cy.visitOpenki("/event/create");
    cy.get("#event-edit-region").should("be.visible");
  });

  describe("should require a venue", () => {
    it("should show error message if the venue input is focused and left empty", () => {
      cy.visitOpenki("/event/create", { region: "h4MnI3psRr8hSljk2" /* Zürich Lernt */ });

      cy.get("#event-edit-venue-search").click().blur();

      // Error message should be visible wafter blurring venue input without selecting a value
      cy.get("#event-edit-venue-search").should("have.class", "is-invalid");

      // Error message about missing venue should still be visible after clicking submit
      cy.get("#events-edit-save").click();
      cy.get("#event-edit-venue-search").should("have.class", "is-invalid");
    });

    it("should have no validation error after a simple location venue was added", () => {
      cy.visitOpenki("/event/create", { region: "h4MnI3psRr8hSljk2" /* Zürich Lernt */ });

      cy.get("#event-edit-venue-search").click();
      cy.get("#edit-venue-typeahead-item-1").click();

      cy.get("#maincontent .leaflet-marker-draggable").click();

      cy.get("#event-edit-venue-displayVenueAs").click();
      cy.get("#event-edit-venue-displayVenueAs").type("Venue name");
      cy.get("#event-edit-venue-locationAddress").click();
      cy.get("#event-edit-venue-locationAddress").type("Streetnumber 7").blur();

      cy.get("#events-edit-save").click();

      // Since we entered a valid venue, no error should be displayed related to the venue.
      cy.get("#edit-venue").children(".is-invalid").should("not.exist");
    });
  });

  describe("event registration", () => {
    it("should by default have registration enabled with unlimited participants", () => {
      cy.visitOpenki("/event/create", { region: "h4MnI3psRr8hSljk2" /* Zürich Lernt */ });

      cy.get("#event-edit-enable-registration").should("be.checked");
      // HTML number inputs represents 0 as ''
      cy.get("#event-edit-max-participants").should("have.value", "");
    });

    it("should show a warning if unchecked", () => {
      cy.visitOpenki("/event/create", { region: "h4MnI3psRr8hSljk2" /* Zürich Lernt */ });

      cy.get("#event-edit-enable-registration").uncheck();
      cy.get("#no-rsvp-notice").should("be.visible");
    });
  });
});
