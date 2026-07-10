// file://./../../imports/api/venues/methods.ts

beforeEach(() => {
  cy.login("1u");
});

describe("Venue save", () => {
  it("Stores a venue", () => {
    const venue = {
      name: "Dönerbude am Ende / Anfang der Galaxis",
      description: "Schön, dass sie uns besuchen, bevor Alles zuende ist.",
      region: "9JyFCoKWkxnf8LWPh", // Testistan
    };

    cy.callMethod("venue.save", "", venue)
      .should("be.a", "string")
      .then((venueId) => {
        // Try saving it again with a change
        const updatedVenue = { ...venue, name: venue.name + "!" };
        cy.callMethod("venue.save", venueId, updatedVenue)
          .should("be.a", "string")
          .then((venueId) => {
            // Finally, remove the venue to avoid influencing other tests
            cy.callMethod("venue.remove", venueId);
          });
      });
  });
});
