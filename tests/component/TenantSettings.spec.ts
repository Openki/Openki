// file://./../../imports/ui/components/tenants/settings/index.tsx

beforeEach(() => {
  cy.visitOpenki("/tenant/03396e52b5", { username: "Kopf" });
});

describe("tenant settings", () => {
  it("should be navigable", () => {
    cy.get(".tenant-details-name").should("contains.text", "Kopf");
  });

  it("should allow to remove, search & add a member", function () {
    cy.get('[data-test="tenant-setting-member-remove-button-Seeeen"]').click();
    cy.get(".alert-success").should("be.visible");

    cy.get("#tenant-settings-members-search").click();
    cy.get("#tenant-settings-members-search").type("Seeeen");

    cy.get('[data-test="tenant-setting-member-add-button-Seeeen"] i.fa-plus').click();
    cy.get(".alert-success").should("be.visible");
  });

  it("should allow to search, add & remove a admin", function () {
    cy.get("#tenant-setting-admins-search").click();
    cy.get("#tenant-setting-admins-search").type("See");

    cy.get('[data-test="tenant-setting-admin-add-button-Seeeen"]').click();
    cy.get(".alert-success").should("be.visible");

    cy.get('[data-test="tenant-setting-admin-remove-button-Seeeen"] i.fa-solid').click();
    cy.get(".alert-success").should("be.visible");
  });
});
