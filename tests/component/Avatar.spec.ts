describe("Avatar", function () {
  it("should show changing hair color", async () => {
    cy.mount("Avatar");
    cy.get(".avatar-image.placeholder-rainbow").should("be.visible");
  });

  it("should show fixed hair color", async () => {
    cy.mount("Avatar", { userId: "93FHfquXAMPXHeqAq", color: 10 });
    cy.get(".avatar-image").should("have.css", "filter").and("not.eq", "none");
  });
});
