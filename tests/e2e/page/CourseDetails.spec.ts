// file://./../../../imports/ui/pages/course-details/index.tsx

describe("course details page", () => {
  // https://gitlab.com/Openki/Openki/-/issues/2228
  it("should display not found page for not existing course", () => {
    cy.visitOpenki("/course/not-exists", { username: "Seee" });

    cy.get("h1").contains("Page not found");
  });

  describe("Organizer group course", function () {
    beforeEach(() => {
      cy.visitOpenki("/course/e49ed1ce5d/walliserduetsch-lernen", { username: "LeOnI" });
    });

    it("should allow to set a group as organizer", () => {
      cy.get('[data-test="course-details"] div.addon button.dropdown-toggle').click();
      cy.get('[data-test="course-details"] li:nth-child(4) a.btn').click();
      cy.get('[data-test="course-details"] button.btn-success').click();
      cy.get(
        '[data-test="course-details"] i[title="Walliserdütsch lernen is co-organized by this group"]',
      ).should("have.class", "fa-bullhorn");
      cy.get('[data-test="course-details"] div.tag-btn.addon button.dropdown-toggle').click();
      cy.get('[data-test="course-details"] a.btn-danger').click();
      cy.get('[data-test="course-details"] div.danger button.btn').click();
    });

    it("should allow a member a organizer group to send a message to all", () => {
      cy.get('[data-test="course-details"] i.contact-members').click();
      cy.get("#discussion div.richtext").type(
        "Postet mal wenn ihr Zeit habt für ein nächstes Treffen.",
      );
      cy.get('#discussion label[for="discussion-post-edit-notify-all"]').should("be.visible");
      cy.get("#discussion button.discussion-save-btn").click();
      cy.get("div.discussion-post-header i.fa-bell").should("be.visible");
    });
  });

  describe("Archive course", function () {
    beforeEach(() => {
      cy.visitOpenki("/course/e49ed1ce5d/walliserduetsch-lernen", { username: "LeOnI" });
    });

    it("should allow to archive and unarchive a course", () => {
      cy.get("button.btn-archive").click();
      cy.get('[data-test="course-details"] div.alert').should("have.class", "alert-archived");
      cy.get("#course-details-course-unarchive").click();
    });
  });

  describe("Single event", function () {
    beforeEach(() => {
      cy.visitOpenki(
        "/course/LZCJQmLzr9d6gcrhH/hochsensibilitaet-was-ist-das-und-die-unterschiede",
      );
    });

    it("should redirect to single event page", () => {
      cy.get(".details-header").should("have.class", "event-details-header");
    });
  });
});
