describe("events map", function () {
  it("should be navigable", () => {
    cy.visitOpenki("/events/map", { username: "greg" });
    // Important to wait so the page loads properly before starting the test
    // NOTE: Once we replace `iron:router`, we should try to remove this artificial delay.
    cy.wait(4000);
    cy.get("h1").should("be.visible");
  });
});
