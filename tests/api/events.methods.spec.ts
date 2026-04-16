// file://./../../imports/api/events/methods.ts

import type { save } from "/imports/api/events/methods";

beforeEach(() => {
  cy.login("1u");
});

describe("Events save", () => {
  it("should throw an error if venue field is empty", () => {
    const args: Parameters<typeof save> = [
      "",
      {
        title: "spring dance",
        description: "go to the park and dance",
        region: "9JyFCoKWkxnf8LWPh", // Testistan

        startLocal: new Date(new Date().valueOf() + 60 * 1000).toISOString(),
        endLocal: new Date(new Date().valueOf() + 2 * 60 * 1000).toISOString(),
      },
    ];
    cy.expectCallMethodThrowsError("event.save", ...args);
  });

  it("should support to create event with a venue", () => {
    const args: Parameters<typeof save> = [
      "",
      {
        title: "spring dance",
        description: "go to the park and dance",
        region: "9JyFCoKWkxnf8LWPh", // Testistan
        venue: { name: "every where" },
        startLocal: new Date(new Date().valueOf() + 60 * 1000).toISOString(),
        endLocal: new Date(new Date().valueOf() + 2 * 60 * 1000).toISOString(),
      },
    ];
    cy.callMethod("event.save", ...args)
      .should("be.a", "string")
      .then((eventId) => {
        // Try saving it again with a change
        cy.callMethod("event.save", eventId, {
          title: "spring dance!",
          description: "go to the forest instead",
        });
      });
  });
});
