beforeEach(() => {
  cy.visitOpenki("/organization/create", { username: "Seee" });
});

describe("Organization create", () => {
  it("should throw a error on create a organization with only a name", () => {
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').click();
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').type("Seeworld");
    cy.get("#organization-details-save").click();
    cy.get("#maincontent span.d-block").should("have.text", "All four fields are mandatory.");
  });

  it("should allow to create a organization with name, short, claim and description", () => {
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').click();
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').type("Seeworld");
    cy.get('#maincontent div[data-medium-editor-editor-index="2"]').type("sw");
    cy.get('#maincontent div[data-medium-editor-editor-index="3"]').type("Swim");
    cy.get('#maincontent div[data-medium-editor-editor-index="4"]').type(
      "Wir gehen gemeinsam in Zürich schwimmen.",
    );
    cy.get("#organization-details-save").click();
    cy.get(".alert-success").should("be.visible");
  });
});
