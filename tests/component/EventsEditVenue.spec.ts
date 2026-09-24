// file://./../../imports/ui/components/events/edit-venue/index.tsx

beforeEach(() => {
  cy.visitOpenki("/event/create?groupId=cbda598713", { username: "sb" });
});

/**
 * Set a consistent `startTime` on the next day.
 * This makes sure the tests run consistently even if the
 * current time is close to the `startTime`.
 */
function setStartTimeNextDay(startTime: string) {
  cy.get("#event-edit-start-date").click().wait(2000);
  cy.get("#event-edit-start-date").type("{downarrow}");
  cy.get("#event-edit-start-date").type("{downarrow}");
  cy.get(".datepicker-days tr:last-of-type td:last-child").click();
  cy.get("#events-edit-start-end-startTime").type(startTime);
}

describe("Events Venue Edit", () => {
  it("should show can only selected by it host for locked venues", function () {
    cy.get("#event-edit-venue-search").type("MechArtLab");
    cy.get("#edit-venue-typeahead-item-0").click();
    cy.get('[data-test="events-edit-venue-hint-restricted-use"]').should("be.visible");
  });

  it("should show parallel event hint", function () {
    setStartTimeNextDay("22:00");
    // Wait for the typeahead to finish searching and rendering
    cy.get("#event-edit-venue-search").type("asz").wait(2000);
    cy.get("#edit-venue-typeahead-item-1").click();
    cy.get('[data-test="events-edit-venue-hint-contact-host"]').should("be.visible");
    cy.get("#events-edit-save").click();

    cy.visit("/event/create?groupId=cbda598713");
    setStartTimeNextDay("22:00");
    // Wait for the typeahead to finish searching and rendering
    cy.get("#event-edit-venue-search").type("asz").wait(2000);
    cy.get("#edit-venue-typeahead-item-1").click();
    cy.get('[data-test="events-edit-venue-hint-parallel-events"]').should("be.visible");
  });
});
