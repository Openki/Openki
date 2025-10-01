beforeEach(() => {
  cy.visitOpenki("/frame/calendar");
});

describe("calendar frame page", function () {
  it("should be navigable", () => {
    cy.get(".frame-list-item-event").should("be.visible");
  });
});
