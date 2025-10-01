beforeEach(() => {
  cy.visitOpenki("/venue/3701eb4ea7");
});

describe("venue details page", () => {
  it("should be navigable", () => {
    cy.getById("venue-details-header").should("be.visible");
  });
});
