import {
  expectNoDataReturnedFromPublication,
  expectPublicationReturnsData,
} from "../support/publication-test-utils";

describe("Log", () => {
  describe("publication", () => {
    const defaultArgs = {
      publication: "log",
      args: [{}, 100],
      collectionName: "Log",
    };

    it("should not allow access for unauthenticated users", () => {
      expectNoDataReturnedFromPublication(defaultArgs);
    });

    it("should not allow access for authenticated users who are not instance admins", () => {
      cy.login("Bob");

      expectNoDataReturnedFromPublication(defaultArgs);
    });

    it("should allow access for instance admins", () => {
      cy.login("greg");

      expectPublicationReturnsData(defaultArgs);
    });
  });
});
