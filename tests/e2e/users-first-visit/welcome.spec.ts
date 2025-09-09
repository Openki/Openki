beforeEach(function () {
  localStorage.setItem("locale", "de");
  cy.visit("/");
});

describe("Users first visit", function () {
  it("should be able to select region ", function () {
    cy.get(".modal-title").should("have.text", "Willkommen auf Hmmm!");
    cy.get(".dropdown-toggle").click();
    cy.get('[title="Spilistan"]').click();
    cy.get('[data-test="region-selection-display"]').should("contain.text", "Spilistan");
  });
});
