// file://./../../../imports/ui/pages/tenant-create/index.ts

beforeEach(() => {
  cy.visitOpenki("/tenant/create");
});

describe("tenant create page", function () {
  it("should be navigable", () => {
    cy.get("h2").should("be.visible");
  });

  it("should support to create a region", function () {
    cy.get("#tenant-edit-name").click();
    cy.get("#tenant-edit-name").type("LabRador");
    cy.get("#region-edit-name").type("Läbi");
    cy.get('[data-test="location-edit-add-marker"] i.fa-location-dot').click();
    cy.get("#region-edit-description").click();
    cy.get("#region-edit-description").click();
    cy.get("#region-edit-description").type("Ein Ort zum Experimentieren.");
    cy.get("#tenant-create-submit").click();
    cy.get("#account-tasks-login-frame-username").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg{enter}");
    cy.get("#maincontent div.tenant-details-name").should("contains.text", "LabRador");
  });
});
