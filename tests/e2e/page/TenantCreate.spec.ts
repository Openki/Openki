beforeEach(() => {
  cy.visitOpenki("/tenant/create");
});

describe("tenant create page", function () {
  it("should be navigable", () => {
    cy.get("h2").should("be.visible");
  });
});
