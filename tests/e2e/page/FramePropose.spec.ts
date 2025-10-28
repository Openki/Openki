// file://./../../../imports/ui/pages/frames/propose/index.tsx

describe("Propose course via frame", function () {
  it("allows to select mentor role", () => {
    cy.visitOpenki("/frame/propose");

    cy.get("label.btn-edit").click();
    cy.get("#editform_name").type("Permakultur im Hausgarten");
    cy.get("#courses-edit-region-selection").select("9JyFCoKWkxnf8LWPh");
    cy.get('[data-test="please-login-button"]').click();
    cy.get('[data-test="account-tasks-login-frame-username"]').type("Seee");
    cy.get('[data-test="account-tasks-login-frame-password"]').type("greg");
    cy.get("#accountTaskModal div.modal-body").click();
    cy.get('[data-test="account-tasks-login-frame-submit"]').click();
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.get('[data-test="course-details"] .course-member-role span.fa-solid').should(
      "have.class",
      "fa-graduation-cap",
    );
  });

  it("allows to add multiple groups", () => {
    cy.visitOpenki("/frame/propose?addTeamGroups=cc89c5e476,573edec5d6");

    cy.get("#editform_name").click();
    cy.get("#editform_name").type("OpenStreetMap für Anfänger");
    cy.get("#courses-edit-region-selection").select("9JyFCoKWkxnf8LWPh");
    cy.get('[data-test="please-login-button"]').click();
    cy.get('[data-test="account-tasks-login-frame-username"]').type("Seee");
    cy.get('[data-test="account-tasks-login-frame-password"]').type("greg{enter}");
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.getById("group-tag-cc89c5e476").should("have.class", "group-tag-is-organizer");
    cy.getById("group-tag-573edec5d6").should("have.class", "group-tag-is-organizer");
  });

  it("allows to set creators role via url", () => {
    cy.visitOpenki("/frame/propose?setCreatorsRoles=mentor");

    cy.get("#editform_name").click();
    cy.get("#editform_name").type("How to Openki");
    cy.get("#courses-edit-region-selection").select("9JyFCoKWkxnf8LWPh");
    cy.get('[data-test="please-login-button"]').click();
    cy.get('[data-test="account-tasks-login-frame-username"]').type("Seee");
    cy.get('[data-test="account-tasks-login-frame-password"]').type("greg{enter}");
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.get('[data-test="course-details"] .course-member-role span.fa-solid').should(
      "have.class",
      "fa-graduation-cap",
    );
  });

  it("should allow to hide categories via url", () => {
    cy.visitOpenki("/frame/propose");
    cy.get(".category-tag").should("be.visible");

    cy.visit("/frame/propose?hideCategories=1");
    cy.get(".category-tag").should("not.exist");
  });
});
