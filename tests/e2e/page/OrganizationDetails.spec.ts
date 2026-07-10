describe("Organization edit", () => {
  describe("Edit group", function () {
    it("should allow to save a group in the organization & member of organization must be able to edit group", () => {
      cy.visitOpenki("/organization/fd3a8d98d4", { username: "Seee" });

      cy.get("#group-edit-title").type("Gewaltfreihe Kommunikation lernen");
      cy.get("#groupEditRolementorEnrollCheck").check();
      cy.get("#groups-edit-save").click();
      cy.get(".alert-success").should("be.visible");
      cy.get('[data-test="organization-tag-fd3a8d98d4"] a').should("be.visible");

      // Members of the organization the group was created in must be able to
      // edit / delete the group.
      // See ticket #1331 organization members can not edit all groups despite their
      // organization being in the teamOrganization.
      // So we login as a member of "SKG" then check whether the edit button shows up.

      cy.logout();

      cy.visitOpenki("/organization/fd3a8d98d4", { username: "Normalo" });
      cy.get('a[href*="gewaltfreihe-kommunikation-lernen"]').click();
      cy.get('[data-test="group-details"] button.btn-edit').should("be.enabled");
      cy.get("#group-details-confirm-delete").click();
      cy.get("#group-details-confirm-dialog-delete").click();
      cy.get(".alert-success").should("be.visible");
    });

    it("should allow to save a group internal in the organization", () => {
      cy.visitOpenki("/organization/fd3a8d98d4", { username: "Normalo" });
      cy.get("#group-edit-title").type("Konfliktkommunikation");
      cy.get('#maincontent label[for="group-edit-internal"]').click();
      cy.get("#group-edit-internal").check();
      cy.get("#groupEditRolehostCheck").uncheck();
      cy.get(".introduction a:first-of-type").click();
      cy.get("#groups-select-categories-misc").check();
      cy.get("#groups-select-subcategories-♥undefined♥").check();
      cy.get("#groups-edit-save").click();
      cy.get('[data-test="group-details"] span.internal-indicator').should("be.visible");
    });
  });
});
