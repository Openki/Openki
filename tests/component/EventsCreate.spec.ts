// file://./../../imports/ui/components/events/edit/index.tsx

describe("event create", () => {
  it("should show region selection if none region set", function () {
    cy.visitOpenki("/event/create");
    cy.get("#event-edit-region").should("be.visible");
  });
});
