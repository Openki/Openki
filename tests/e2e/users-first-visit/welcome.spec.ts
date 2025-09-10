beforeEach(() => {
  cy.visitOpenki("/", { region: "" });
});

describe("Users first visit", () => {
  it("should be able to select region ", () => {
    cy.get(".modal-title").should("have.text", "Willkommen auf Hmmm!");
    cy.get(".dropdown-toggle").click();
    cy.get('[title="Spilistan"]').click();
    cy.get('[data-test="region-selection-display"]').should("contain.text", "Spilistan");
  });
});
