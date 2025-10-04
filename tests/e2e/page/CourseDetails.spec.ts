// file://./../../../imports/ui/pages/course-details/index.ts

describe("course details page", () => {
  // https://gitlab.com/Openki/Openki/-/issues/2228
  it("should display not found page for not existing course", () => {
    cy.visitOpenki("/course/not-exists", { username: "Seee" });

    cy.get("h1").contains("Page not found");
  });
});
