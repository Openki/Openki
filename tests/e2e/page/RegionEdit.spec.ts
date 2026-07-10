// file://./../../../imports/ui/pages/region-details/index.ts

beforeEach(() => {
  cy.visitOpenki("/region/create?tenant=8410c099a7", { username: "greg" });
});

describe("region create page", function () {
  it("should be navigable", () => {
    cy.get("h2").should("be.visible");
  });

  it("should support to create a region", function () {
    cy.get("#region-edit-name").click();
    cy.get("#region-edit-name").type("Luzern");
    cy.get('[data-test="location-edit-add-marker"] i.fa-location-dot').click();
    cy.get("#region-edit-description").click();
    cy.get("#region-edit-description").type("Openki in Luzern");
    cy.get("#regions-edit-save").click();
    cy.get(".region-details-header").should("have.text", "Luzern");
  });
});
