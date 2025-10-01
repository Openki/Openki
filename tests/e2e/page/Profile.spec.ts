beforeEach(() => {
  cy.visitOpenki("/profile", { username: "Kopf" });
});

describe("profile page", function () {
  it("should be navigable", async () => {
    cy.getById("profile-header").should("be.visible");
  });

  it('should show "My organizations" section if user is admin of one', async function () {
    cy.getById("profile-tenant-section-header").should("be.visible");
  });

  it('should allow to change e-mail', function() {
    
    cy.get('#editform_email').click();
    cy.get('#editform_email').clear();
    cy.get('#editform_email').type('kopf@openki.example1');
    cy.get('#maincontent .btn-cancel').click();
    cy.get('#outer .modal-title').click();
    cy.get('#outer .modal-title').should('be.visible');
  });
});
