beforeEach(() => {
  cy.visitOpenki("/group/create", { username: "Seee" });
});

describe("Group create", () => {
  it("should throw a error on create a group with only a name", () => {
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').click();
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').type('Seeworld');
    cy.get('#group-details-save').click();
    cy.get('#maincontent span.d-block').should('have.text', 'All four fields are mandatory.');
  });

  it("should allow to create a group with name, short, claim and description", () => {
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').click();
    cy.get('#maincontent div[data-medium-editor-editor-index="1"]').type('Seeworld');
    cy.get('#maincontent div[data-medium-editor-editor-index="2"]').type('sw');
    cy.get('#maincontent div[data-medium-editor-editor-index="3"]').type('Swim');
    cy.get('#maincontent div[data-medium-editor-editor-index="4"]').type('Wir gehen gemeinsam in Zürich schwimmen.');
    cy.get('#group-details-save').click();
    cy.get('.alert-success').should('be.visible');
  });
});
