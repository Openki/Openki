// file://./../../../imports/ui/pages/admin/users/index.tsx

beforeEach(() => {
  cy.visitOpenki("/admin/users", { username: "greg" });
});

describe("admin users page", () => {
  it("should be navigable", () => {
    cy.get("#maincontent h3").should("be.visible");
  });

  it("should allow to find an user", function () {
    cy.get("#maincontent input.form-control").click();
    cy.get("#maincontent input.form-control").type("See");
    cy.get(".list-group-item").first().click();
    cy.get("#maincontent h1").should("contains.text", "Seee");
  });
});
