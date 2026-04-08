describe("Organization edit", () => {
  describe("Edit course", function () {
    it("should allow to save a course in the organization & member of organization must be able to edit course", () => {
      cy.visitOpenki("/organization/fd3a8d98d4", { username: "Seee" });

      cy.get("#group-edit-title").type("Gewaltfreihe Kommunikation lernen");
      cy.get("#courseEditRolementorEnrollCheck").check();
      cy.get("#courses-edit-save").click();
      cy.get(".alert-success").should("be.visible");
      cy.get('[data-test="organization-tag-fd3a8d98d4"] a').should("be.visible");

      // Members of the organization the course was created in must be able to
      // edit / delete the course.
      // See ticket #1331 organization members can not edit all courses despite their
      // organization being in the teamOrganization.
      // So we login as a member of "SKG" then check whether the edit button shows up.

      cy.logout();

      cy.visitOpenki("/organization/fd3a8d98d4", { username: "Normalo" });
      cy.get('a[href*="gewaltfreihe-kommunikation-lernen"]').click();
      cy.get('[data-test="group-details"] button.btn-edit').should("be.enabled");
      cy.get("#group-details-confirm-delete").click();
      cy.get("#coures-details-confirm-dialog-delete").click();
      cy.get(".alert-success").should("be.visible");
    });

    it("should allow to save a course internal in the organization", () => {
      cy.visitOpenki("/organization/fd3a8d98d4", { username: "Normalo" });
      cy.get("#group-edit-title").type("Konfliktkommunikation");
      cy.get('#maincontent label[for="group-edit-internal"]').click();
      cy.get("#group-edit-internal").check();
      cy.get("#courseEditRolehostCheck").uncheck();
      cy.get("#maincontent i.fa-angle-down").click();
      cy.get("#courses-select-categories-misc").check();
      cy.get("#courses-select-subcategories-♥undefined♥").check();
      cy.get("#courses-edit-save").click();
      cy.get('[data-test="group-details"] span.internal-indicator').should("be.visible");
    });
  });
});
