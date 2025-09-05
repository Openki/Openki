beforeEach(function () {
  cy.visit("/");
});

describe("Login", function () {
  it("Should login successfully", function () {
    cy.get(".site-stage").contains("DEV");
  });
});

describe("FAQ", function () {
  it("Price policy is open", function () {
    cy.get(".btn-close").click();
    cy.get(".price-policy-content > :nth-child(2) > a > .icon-text > .icon-text-text").click();
    cy.get(".mw-md :nth-child(42)").click();
    cy.get(".mw-md :nth-child(42)").should("be.visible");
  });
});
