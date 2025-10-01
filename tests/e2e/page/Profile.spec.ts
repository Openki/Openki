beforeEach(() => {
  // file://./../../../imports/ui/pages/profile/index.tsx
  cy.visitOpenki("/profile", { username: "Kopf" });
});

describe("profile page", () => {
  it("should be navigable",  () => {
    cy.getById("profile-header").should("be.visible");
  });

  it('should show "My organizations" section if user is admin of one',  function () {
    cy.getById("profile-tenant-section-header").should("be.visible");
  });

  it("should allow to change e-mail", () => {
    cy.get("#editform_email").clear();
    cy.get("#editform_email").type("kopf@openki.example1");
    cy.get("#maincontent .btn-cancel").click();
    cy.get("#outer .modal-title").should("be.visible");
  });
});
