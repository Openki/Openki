describe("Users first visit", () => {
  it("should be able to select region ", () => {
    cy.visitOpenki("/", { region: "" });

    // Important to wait so the page loads properly before starting the test
    // NOTE: Once we replace `iron:router`, we should try to remove this artificial delay.
    cy.wait(3000);
    cy.get(".modal-title").should("have.text", "Welcome to Hmmm!");
    cy.get(".dropdown-toggle").click();
    cy.get('[title="Spilistan"]').click();
    cy.get('[data-test="region-select-display"]').should("contain.text", "Spilistan");
  });
});
