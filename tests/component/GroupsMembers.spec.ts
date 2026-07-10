describe("Group members component", function () {
  describe("Subscribe to participant role", function () {
    it("should keep comment", () => {
      cy.visitOpenki("/group/6cac962a5f/game-design-mit-unity");
      cy.get('[data-test="group-role-enroll-participant"]').click();
      cy.get("#group-role-enroll-participant-content #role-comment").type(
        "I want to program an open see world.",
      );
      cy.get("#group-roles-join").click();
      cy.get("#account-tasks-login-frame-username").type("Normalo");
      cy.get("#account-tasks-login-frame-password").type("greg{enter}");
      // [aria-controls] includes "participant" div.editable
      cy.get('[data-test="group-details"] div.editable').should(
        "have.text",
        "I want to program an open see world.",
      );

      // unsubscribe
      cy.get('#subscribe [aria-controls*="participant"]').click();
    });
  });
});
