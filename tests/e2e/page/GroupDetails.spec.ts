// file://./../../../imports/ui/pages/group-details/index.tsx

describe("group details page", () => {
  // https://gitlab.com/Openki/Openki/-/issues/2228
  it("should display not found page for not existing group", () => {
    cy.visitOpenki("/group/not-exists", { username: "Seee" });

    cy.get("h1").contains("Page not found");
  });

  it.only("should only update title and description without modifying other group data", () => {
    // Regression test for https://gitlab.com/Openki/Openki/-/work_items/2577
    cy.visitOpenki("/groups/propose", {
      username: "MazeSignal",
    });

    // Set region to Projectistan since it has custom roles enabled
    localStorage.setItem("region", "5JyFCoKwkxnf8LWoh");
    cy.reload();
    cy.allSubscriptionsReady();

    const title = "edit_test";

    // Create a group with custom roles
    cy.get("#group-edit-title").type(title);
    cy.get("#group-edit-description").type("something");
    cy.get("#group-edit-role-select").click();
    cy.get("div[class$='-menu']").contains("builder").click();
    cy.get("#groups-edit-save").click();

    // // Edit title and verify that roles remain.
    cy.get(".group-details-title button").click();
    cy.get(".group-details-title .editable").type("2");
    cy.get("#editable-save").click();
    cy.get("#subscribe").contains("a builder").should("exist");

    // // Edit description and verify that roles remain.
    cy.get("#group-description button").click();
    cy.get("#group-description .editable").type("2");
    cy.get("#editable-save").click();
    cy.get("#subscribe").contains("a builder").should("exist");

    // Cleanup
    cy.get("#group-details-confirm-delete").click();
    cy.get("#group-details-confirm-dialog-delete").click();
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
      cy.get("#group-members-notify-all").click();
      cy.get("#discussion div.richtext").type(
        "Postet mal wenn ihr Zeit habt für ein nächstes Treffen.",
      );
      cy.get('#discussion label[for="discussion-post-edit-notify-all"]').should("be.visible");
      cy.get("#discussion button.discussion-save-btn").click();
      cy.get("div.discussion-post-header i.fa-bell").should("be.visible");
    });
  });

  describe("Archive group", function () {
    it("should allow to archive and unarchive a group", () => {
      cy.visitOpenki("/group/e49ed1ce5d/walliserduetsch-lernen", { username: "LeOnI" });
      cy.get("button.btn-archive").click();
      cy.get('[data-test="group-details"] div.alert').should("have.class", "alert-archived");
      cy.get("#group-details-group-unarchive").click();
    });
  });

  describe("Single event", function () {
    it("should redirect to single event page", () => {
      cy.visitOpenki("/group/LZCJQmLzr9d6gcrhH/hochsensibilitaet-was-ist-das-und-die-unterschiede");
      // Explicitly wait for the redirect to complete. This allows the router to re-render the app with the expected state.
      // NOTE: Once we replace `iron:router`, we should try to remove this artificial delay.
      cy.wait(500);
      cy.get(".details-header").should("have.class", "event-details-header");
    });
  });
});
