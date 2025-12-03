describe("Group edit", () => {
  describe("Edit course", function () {
    it("should allow to save a course in the group & member of group must be able to edit course", () => {
      cy.visitOpenki("/group/fd3a8d98d4", { username: "Seee" });

      cy.get("#course-edit-title").type("Gewaltfreihe Kommunikation lernen");
      cy.get("#courseEditRolementorEnrollCheck").check();
      cy.get("#courses-edit-save").click();
      cy.get(".alert-success").should("be.visible");
      cy.get('[data-test="group-tag-fd3a8d98d4"] a').should("be.visible");

      // Members of the group the course was created in must be able to
      // edit / delete the course.
      // See ticket #1331 group members can not edit all courses despite their
      // group being in the orga-team.
      // So we login as a member of "SKG" then check whether the edit button shows up.

      cy.logout();

      cy.visitOpenki("/group/fd3a8d98d4", { username: "Normalo" });
      cy.get('a[href*="gewaltfreihe-kommunikation-lernen"]').click();
      cy.get('[data-test="course-details"] button.btn-edit').should("be.enabled");
      cy.get("#course-details-confirm-delete").click();
      cy.get("#coures-details-confirm-dialog-delete").click();
      cy.get(".alert-success").should("be.visible");
    });

    it("should allow to save a course internal in the group", () => {
      cy.visitOpenki("/group/fd3a8d98d4", { username: "Normalo" });
      cy.get("#course-edit-title").type("Konfliktkommunikation");
      cy.get('#maincontent label[for="course-edit-internal"]').click();
      cy.get("#course-edit-internal").check();
      cy.get("#courseEditRolehostCheck").uncheck();
      cy.get("#maincontent i.fa-angle-down").click();
      cy.get('[name="misc"]').check();
      cy.get('[name="♥undefined♥"]').check();
      cy.get("#courses-edit-save").click();
      cy.get('[data-test="course-details"] span.internal-indicator').should("be.visible");
    });
  });
});
