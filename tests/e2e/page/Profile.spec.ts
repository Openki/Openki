// file://./../../../imports/ui/pages/profile/index.tsx

beforeEach(() => {
  cy.visitOpenki("/profile", { username: "Kopf" });
});

describe("profile page", () => {
  it("should be navigable", () => {
    cy.getById("profile-header").should("be.visible");
  });

  it('should show "My organizations" section if user is admin of one', function () {
    cy.getById("profile-tenant-section-header").should("be.visible");
  });

  
});
