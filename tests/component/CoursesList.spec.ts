beforeEach(() => {
  cy.visitOpenki("/search", { region: "9JyFCoKWkxnf8LWPh" /* Testistan */ });
});

describe("Course list component", function () {
  it("should list 5 courses for unauthenticated user (Testistan)", async () => {
    cy.get('.course-compact-title [href="/course/c294d35055/deutschkurs"]').should("be.visible");
    cy.get('.course-compact-title [href="/course/26daa40373/schweissen"]').should("be.visible");
    cy.get('.course-compact-title [href="/course/f59a1e7855/lerne-russisch-in-2-stunden"]').should(
      "be.visible",
    );
    cy.get('.course-compact-title [href="/course/e78854c387/aikido"]').should("be.visible");
    cy.get('.course-compact-title [href="/course/5dbf3bec62/elektronik"]').should("be.visible");
    cy.get('.course-compact-title [href="/course/4f1f51d8b4/first-aid-course"]').should(
      "be.visible",
    );
    cy.get('.course-compact-title [href="/course/13cb1df8d5/velo-flicken"]').should("be.visible");
  });
});
