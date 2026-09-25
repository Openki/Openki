// file://./../../imports/ui/components/EditCustomFields.tsx

describe("EditCustomFields", () => {
  it("should allow to edit custom field on group", function () {
    cy.visitOpenki("/group/hkS2FN5p98EztPBuM/singen-fuer-klein-gross?force=1", {
      username: "Tara",
    });

    cy.get("#group-details-edit").click();
    cy.get("#group-custom-field-email").clear();
    cy.get("#group-custom-field-email").type("tara@openki.example");
    cy.get("#group-custom-field-instructor").clear();
    cy.get("#group-custom-field-instructor").type("Tara");
    cy.get("#groups-edit-save").click();
    cy.get("#description p:nth-child(5) span.whitespace-pre-line").should(
      "have.text",
      "tara@openki.example",
    );
  });

  it("should allow to edit custom field on event", function () {
    cy.visitOpenki("/event/fZcwCD5CJvuLdrHg2/singen-fuer-klein-gross", {
      username: "Tara",
    });
    cy.get("#events-display-body-edit").click();
    cy.get("#group-custom-field-target").clear();
    cy.get("#group-custom-field-target").type("Kinder, mit Begleitperson");
    cy.get("#events-edit-save").click();
    cy.get("#description div.col-md-7 > p:nth-child(3)").should(
      "have.text",
      "For: Kinder, mit Begleitperson",
    );
  });

  it("should allow to edit option custom field", function () {
    cy.visitOpenki("/group/40ccd81ccf/notebooks-auf-ubuntu-linux-umruesten", {
      username: "Tonya",
    });
    cy.get('[data-test="group-details"] button.btn-edit').click();
    cy.get("#group-custom-field-lang").select("de");
    cy.get("#groups-edit-save").click();
    cy.get("#description p:nth-child(4)").should("have.text", "Language: German");
  });

  it("should allow to edit boolean custom field", function () {
    cy.visitOpenki("/group/40ccd81ccf/notebooks-auf-ubuntu-linux-umruesten", {
      username: "Tonya",
    });

    cy.get("#description p:nth-child(3)").should("have.text", "Recording: No");
    cy.get('[data-test="group-details"] button.btn-edit').click();
    cy.get('[data-test="group-details"] label[for="group-custom-field-recording"]').click();
    cy.get("#group-custom-field-recording").check();
    cy.get("#groups-edit-save").click();
    cy.get("#description p:nth-child(3)").should("have.text", "Recording: Yes");
    cy.get('[data-test="group-details"] button.btn-edit').click();
    cy.get("#group-custom-field-recording").uncheck();
    cy.get("#groups-edit-save").click();
    cy.get("#description p:nth-child(3)").should("have.text", "Recording: No");
  });
});
