// file://./../../imports/ui/components/tenants/settings/index.ts

beforeEach(() => {
  cy.visitOpenki("/tenant/03396e52b5", { username: "Kopf" });
});

describe("admin users page", () => {
  it("should be navigable", () => {
    cy.get(".tenant-details-name").should("contains.text", "Kopf");
  });
});
