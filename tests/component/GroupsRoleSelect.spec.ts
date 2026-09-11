describe("Group role select component", function () {
  describe("CustomRoles", function () {
    it("should allow to add role with label & should be possible to subscribe to custom role", () => {
      cy.visitOpenki("/group/BeKNiFJAscaTtxTzq/openstreetmap-fur-anfanger", { username: "Seee" });
      cy.get("#group-details-edit").click();
      cy.get('[data-test="group-details"] label[for="group-edit-role-select"]').click();
      cy.get("#group-edit-role-select").type("Kartograph{enter}");
      cy.get("#groups-edit-save").click();
      cy.get("#subscribe > button:last").should("contain.text", "Kartograph");

      // subscribe to custom role
      cy.login("Flumsi");

      cy.get('[data-test="group-BeKNiFJAscaTtxTzq-role-enroll-kartograph-custom-button"]').click();
      cy.get("#group-BeKNiFJAscaTtxTzq-role-enroll-kartograph-custom-join").click();
      cy.get('[data-test="group-details"] .bg-user .role-short').should(
        "contain.text",
        "Kartograph",
      );

      // remove
      cy.login("Seee");
    });
  });
});
