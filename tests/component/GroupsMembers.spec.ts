describe("Group members component", function () {
  describe("Subscribe to participant role", function () {
    it("should keep comment", () => {
      cy.visitOpenki("/group/6cac962a5f/game-design-mit-unity");
      cy.get('[data-test="group-6cac962a5f-role-enroll-participant-predefined-button"]').click();
      cy.get("#group-6cac962a5f-role-enroll-participant-predefined-comment").type(
        "I want to program an open see world.",
      );
      cy.get("#group-6cac962a5f-role-enroll-participant-predefined-join").click();
      cy.get("#account-tasks-login-frame-username").type("Normalo");
      cy.get("#account-tasks-login-frame-password").type("greg{enter}");
      cy.get('[data-test="group-details"] div.editable').should(
        "have.text",
        "I want to program an open see world.",
      );

      // unsubscribe
      cy.get('#subscribe [aria-controls*="participant"]').click();
    });
  });
});
