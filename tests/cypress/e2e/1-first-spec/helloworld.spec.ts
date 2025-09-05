beforeEach(function () {
  cy.visit("/");
});

describe("Login", function () {
  it("Should login successfully", function () {
    cy.get(".site-stage").contains("DEV");
  });
});
