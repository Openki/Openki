beforeEach(function () {
  localStorage.setItem("locale", "de");
  localStorage.setItem("region", "all");
  cy.visit("/venues");
});

describe("Venues map", () => {
  it("should be navigable", () => {
    cy.get("h1").should("include.text", "Veranstaltungsorte");
  });
});
