// file://./../../imports/ui/components/events/edit-venue/index.tsx

beforeEach(() => {
  cy.visitOpenki("/event/create?courseId=cbda598713", { username: "sb" });
});

describe("Events Venue Edit", () => {
  it("should show can only selected by it host for locked venues", function () {
    cy.get("#maincontent input.rbt-input-main").click();
    cy.get("#maincontent input.focus").type("MechArtLab");
    cy.get("#edit-venue-typeahead-item-0 strong").click();
    cy.get('[data-test="events-edit-venue-hint-restricted-use"]').should("be.visible");
  });
  it("should show parallel event hint", function () {
    cy.get('[data-test="events-edit-start-end-startTime"]').type("22:00");
    cy.get("#maincontent input.rbt-input-main").click();
    cy.get("#maincontent input.focus").type("asz");
    cy.get("#edit-venue-typeahead-item-1 strong").click();
    cy.get('[data-test="events-edit-venue-hint-contact-host"]').should("be.visible");
    cy.get('[data-test="please-login-button"]').click();

    cy.visit("/event/create?courseId=cbda598713");
    cy.get('[data-test="events-edit-start-end-startTime"]').type("22:00");
    cy.get("#maincontent input.rbt-input-main").click();
    cy.get("#maincontent input.focus").type("asz");
    cy.get("#edit-venue-typeahead-item-1 strong").click();
    cy.get('[data-test="events-edit-venue-hint-parallel-events"]').should("be.visible");
  });
});
