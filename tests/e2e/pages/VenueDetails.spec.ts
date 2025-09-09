beforeEach(function () {
  localStorage.setItem("locale", "de");
  localStorage.setItem("region", "all");

  cy.visit("/venue/3701eb4ea7");
});

describe("venue details page", function () {
  it("should be navigable", () => {
    cy.get('[data-test="venue-details-header"]').should("include.text", "Hischengraben 3 ");
  });
});
