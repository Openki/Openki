describe("Course members component", function () {
  describe("Subscribe to participant role", function () {
    it("should keeps comment", () => {
      cy.visitOpenki("/course/6cac962a5f/game-design-mit-unity");
      cy.get('[data-test="course-role-enroll-participant"]').click();
      cy.get("#subscribe textarea.js-comment").type("I want to program an open see world.");
      cy.get("#course-roles-join").click();
      cy.get('[data-test="account-tasks-login-frame-username"]').type("Normalo");
      cy.get('[data-test="account-tasks-login-frame-password"]').type("greg{enter}");
      cy.get('[data-test="course-details"] div.editable').should(
        "have.text",
        "I want to program an open see world.",
      );

      // unsubscribe
      cy.get('#subscribe [name="participant"]').click();
    });
  });
});
