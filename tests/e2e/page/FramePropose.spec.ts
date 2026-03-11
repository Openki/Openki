// file://./../../../imports/ui/pages/frames/propose/index.tsx

describe("Propose course via frame", function () {
  it("allows to select mentor role", () => {
    cy.visitOpenki("/frame/propose");

    cy.get("label.btn-edit").click();
    cy.get("#course-edit-title").type("Permakultur im Hausgarten");
    cy.get("#courses-edit-region-selection").select("9JyFCoKWkxnf8LWPh");
    cy.get("#courses-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg");
    cy.get("#accountTaskModal div.modal-body").click();
    cy.get("#account-tasks-login-frame-submit").click();
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.get('[data-test="course-details"] .course-member-role i').should(
      "have.class",
      "fa-graduation-cap",
    );
  });

  it("allows to add multiple organizations", () => {
    cy.visitOpenki("/frame/propose?addTeamOrganizations=cc89c5e476,573edec5d6");

    cy.get("#course-edit-title").click();
    cy.get("#course-edit-title").type("OpenStreetMap für Anfänger");
    cy.get("#courses-edit-region-selection").select("9JyFCoKWkxnf8LWPh");
    cy.get("#courses-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg{enter}");
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.getById("group-tag-cc89c5e476").should("have.class", "group-tag-is-organizer");
    cy.getById("group-tag-573edec5d6").should("have.class", "group-tag-is-organizer");
  });

  it("allows to set creators role via url", () => {
    cy.visitOpenki("/frame/propose?setCreatorsRoles=mentor");

    cy.get("#course-edit-title").click();
    cy.get("#course-edit-title").type("How to Openki");
    cy.get("#courses-edit-region-selection").select("9JyFCoKWkxnf8LWPh");
    cy.get("#courses-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg{enter}");
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.get('[data-test="course-details"] .course-member-role i').should(
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
