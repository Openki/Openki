describe("Group history", function () {
  it("should show a entry for group create and should show a entry for user subscribe", async () => {
    cy.visitOpenki("/courses/propose");

    const randomTitle = `COURSEHISTORY${1000 + Math.floor(Math.random() * 9000)}`;

    cy.get("#group-edit-title");

    cy.login("Seee");

    // Create the group
    cy.get("#group-edit-title").type(randomTitle);
    cy.get("#courses-edit-region-select").select("9JyFCoKWkxnf8LWPh");
    cy.get("#courses-edit-save").click();

    // We should be redirected to the created group
    cy.get('[data-test="group-details"]');

    cy.get("#history-tab").click();
    cy.get("#history .grouphistory-event").should("be.visible");

    // Bases on the previous test: should show a entry for user subscribe
    cy.login("Flumsi");

    cy.get("#description-tab .tab-label").click();
    cy.get('#subscribe [name="participant"]').click();
    cy.get('[data-test="navbar-login-button"]').click();
    cy.get("#courses-edit-save").click();

    cy.get("#history-tab .tab-label").click();
    cy.get("#history div:nth-child(2) > .grouphistory-event").should("be.visible");
  });
});
