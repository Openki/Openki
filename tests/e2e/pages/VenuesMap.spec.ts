beforeEach(function () {
  cy.visitOpenki("/venues");
});

describe("Venues map", () => {
  it("should be navigable", () => {
    cy.get("h1").should("be.visible");
  });
});
