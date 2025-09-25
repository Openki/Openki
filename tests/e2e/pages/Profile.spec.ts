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
});
