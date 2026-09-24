// file://./../../../imports/ui/pages/frames/propose/index.tsx

describe("Propose group via frame", function () {
  it("allows to select mentor role", () => {
    cy.visitOpenki("/frame/propose");

    cy.get("label.btn-edit").click();
    cy.get("#group-edit-title").type("Permakultur im Hausgarten");
    cy.get("#groups-edit-region-select").select("9JyFCoKWkxnf8LWPh");
    cy.get("#groups-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg");
    cy.get("#accountTaskModal div.modal-body").click();
    cy.get("#account-tasks-login-frame-submit").click();
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.get('[data-test="group-details"] .group-member-role i').should(
      "have.class",
      "fa-graduation-cap",
    );
  });

  it("allows to add multiple organizations", () => {
    cy.visitOpenki("/frame/propose?addTeamOrganizations=cc89c5e476,573edec5d6");

    cy.get("#group-edit-title").click();
    cy.get("#group-edit-title").type("OpenStreetMap für Anfänger");
    cy.get("#groups-edit-region-select").select("9JyFCoKWkxnf8LWPh");
    cy.get("#groups-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg{enter}");
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.getById("organization-tag-cc89c5e476").should("have.class", "organization-tag-is-team");
    cy.getById("organization-tag-573edec5d6").should("have.class", "organization-tag-is-team");
  });

  it("allows to set creators role via url", () => {
    cy.visitOpenki("/frame/propose?setCreatorsRoles=mentor");

    cy.get("#group-edit-title").click();
    cy.get("#group-edit-title").type("How to Openki");
    cy.get("#groups-edit-region-select").select("9JyFCoKWkxnf8LWPh");
    cy.get("#groups-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg{enter}");
    cy.get("a.alert-link").invoke("removeAttr", "target").click();
    cy.get('[data-test="group-details"] .group-member-role i').should(
      "have.class",
      "fa-graduation-cap",
    );
  });

  it("should allow to hide categories via url", () => {
    cy.visitOpenki("/frame/propose");
    cy.get("#groups-edit-add-categories").should("be.visible");

    cy.visit("/frame/propose?hideCategories=1");
    cy.get("#groups-edit-add-categories").should("not.exist");
  });
});
