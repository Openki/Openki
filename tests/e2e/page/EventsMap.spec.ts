beforeEach(() => {
  cy.visitOpenki("/events/map", { username: "greg" });
});

describe("events map", function () {
  it("should be navigable", () => {
    cy.get("h1").should("be.visible");
  });
});
