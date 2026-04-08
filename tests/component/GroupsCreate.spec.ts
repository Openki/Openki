// file://./../../imports/ui/components/courses/edit/index.tsx

describe("groups create", () => {
  it("should show region selection if none region set", function () {
    cy.visitOpenki("/courses/propose");
    cy.get("#courses-edit-region-select").should("be.visible");
    cy.get("#courses-edit-region-select").select("h4MnI3psRr8hSljk2");
    cy.get("#group-edit-title").click();
    cy.get("#group-edit-title").type("Lebensmittel einmachen");
    cy.get("#group-custom-field-instructor").click();
    cy.get("#group-custom-field-instructor").type("Magu");
    cy.get("#courses-edit-save").click();
    cy.get("#account-tasks-login-frame-username").type("Seee");
    cy.get("#account-tasks-login-frame-password").type("greg{enter}");
    cy.get('[data-test="group-details"] div.region-tag').should("include.text", "Zürich (Lernt)");
  });
});
