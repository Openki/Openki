// file://./../../../imports/ui/pages/group-details/index.tsx

describe("group details page", () => {
  // https://gitlab.com/Openki/Openki/-/issues/2228
  it("should display not found page for not existing group", () => {
    cy.visitOpenki("/group/not-exists", { username: "Seee" });

    cy.get("h1").contains("Page not found");
  });

  describe("Team organization group", function () {
    beforeEach(() => {
      cy.visitOpenki("/group/e49ed1ce5d/walliserduetsch-lernen", { username: "LeOnI" });
    });

    it("should allow to set a organization as team", () => {
      cy.get('[data-test="group-details"] div.addon button.dropdown-toggle').click();
      cy.get('[data-test="group-details"] li:nth-child(4) a.btn').click();
      cy.get('[data-test="group-details"] .organization-tool-dialog button.btn-success').click();
      cy.get(
        '[data-test="group-details"] i[title="Walliserdütsch lernen is co-organized by this organization"]',
      ).should("have.class", "fa-bullhorn");
      cy.get('[data-test="group-details"] div.tag-btn.addon button.dropdown-toggle').click();
      cy.get('[data-test="group-details"] a.btn-danger').click();
      cy.get('[data-test="group-details"] div.danger button.btn').click();
    });

    it("should allow a member a team organization to send a message to all", () => {
      cy.get('[data-test="group-details"] i.contact-members').click();
      cy.get("#discussion div.richtext").type(
        "Postet mal wenn ihr Zeit habt für ein nächstes Treffen.",
      );
      cy.get('#discussion label[for="discussion-post-edit-notify-all"]').should("be.visible");
      cy.get("#discussion button.discussion-save-btn").click();
      cy.get("div.discussion-post-header i.fa-bell").should("be.visible");
    });
  });

  describe("Archive group", function () {
    beforeEach(() => {
      cy.visitOpenki("/group/e49ed1ce5d/walliserduetsch-lernen", { username: "LeOnI" });
    });

    it("should allow to archive and unarchive a group", () => {
      cy.get("button.btn-archive").click();
      cy.get('[data-test="group-details"] div.alert').should("have.class", "alert-archived");
      cy.get("#group-details-group-unarchive").click();
    });
  });

  describe("Single event", function () {
    beforeEach(() => {
      cy.visitOpenki("/group/LZCJQmLzr9d6gcrhH/hochsensibilitaet-was-ist-das-und-die-unterschiede");
    });

    it("should redirect to single event page", () => {
      cy.get(".details-header").should("have.class", "event-details-header");
    });
  });
});
