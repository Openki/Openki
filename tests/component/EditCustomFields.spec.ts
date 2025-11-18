// file://./../../imports/ui/components/EditCustomFields.tsx

describe("EditCustomFields", () => {
  it("should allow to edit custom field on course", function () {
    cy.visitOpenki("/course/hkS2FN5p98EztPBuM/singen-fuer-klein-gross?force=1", {
      username: "Tara",
    });

    cy.get('[data-test="course-details"] button.btn-edit').click();
    cy.get("#course-custom-field-email").clear();
    cy.get("#course-custom-field-email").type("tara@openki.example");
    cy.get("#course-custom-field-instructor").clear();
    cy.get("#course-custom-field-instructor").type("Tara");
    cy.get("#courses-edit-save").click();
    cy.get("#description p:nth-child(5) span.pre-line").should("have.text", "tara@openki.example");
  });

  it("should allow to edit custom field on event", function () {
    cy.visitOpenki("/event/fZcwCD5CJvuLdrHg2/singen-fuer-klein-gross", {
      username: "Tara",
    });
    cy.get("#maincontent button.btn-edit.text-nowrap").click();
    cy.get("#course-custom-field-target").clear();
    cy.get("#course-custom-field-target").type("Kinder, mit Begleitperson");
    cy.get("#events-edit-save").click();
    cy.get("#description div.col-md-7 > p:nth-child(3)").should(
      "have.text",
      "For: Kinder, mit Begleitperson",
    );
  });
});
