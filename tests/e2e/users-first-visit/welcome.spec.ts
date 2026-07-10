beforeEach(() => {
  cy.visitOpenki("/", { region: "" });
});

describe("Users first visit", () => {
  it("should be able to select region ", () => {
    // Important to wait so the page loads properly before starting the test
    cy.wait(2000);
    cy.get(".modal-title").should("have.text", "Welcome to Hmmm!");
    cy.get(".dropdown-toggle").click();
    cy.get('[title="Spilistan"]').click();
    cy.get('[data-test="region-select-display"]').should("contain.text", "Spilistan");
  });
});
