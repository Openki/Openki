describe("Group role select component", function () {
  describe("CustomRoles", function () {
    it("should allow to add role with label & should be possible to subscribe to custom role", () => {
      cy.visitOpenki("/group/4f1f51d8b4/first-aid-course", { username: "Seee" });
      cy.get("#group-details-edit").click();
      cy.get('[data-test="group-details"] label[for="group-edit-role-select"]').click();
      cy.get("#group-edit-role-select").type("Sanitäter{enter}");
      cy.get("#groups-edit-save").click();
      cy.get("#subscribe > button:last").should("contain.text", "Sanitäter");

      // subscribe to custom role
      cy.login("Flumsi");

      cy.get('[data-test="group-4f1f51d8b4-role-enroll-sanitater-custom-button"]').click();
      cy.get("#group-4f1f51d8b4-role-enroll-sanitater-custom-join").click();
      cy.get('[data-test="group-details"] .bg-user .role-short').should(
        "contain.text",
        "Sanitäter",
      );

      // remove
      cy.login("Seee");
      cy.get("#group-details-edit").click();
      cy.get("#role-select-sanitater-custom").click();
      cy.get("#groups-edit-save").click();
    });
  });
});
