describe("Avatar", function () {
  it("should show changing hair color", async () => {
    cy.mount("Avatar");
    cy.get('[data-test="avatar-image"].placeholder-rainbow').should("be.visible");
  });

  it("should show fixed hair color", async () => {
    cy.mount("Avatar", { userId: "93FHfquXAMPXHeqAq", color: 10 });
    cy.get('[data-test="avatar-image"]').should("have.css", "filter").and("not.eq", "none");
  });
});
