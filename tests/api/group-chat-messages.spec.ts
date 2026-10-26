import { SystemRoles } from "../../imports/api/groups/lib/Role";
import {
  expectNoDataReturnedFromPublication,
  expectPublicationReturnsData,
} from "../support/publication-test-utils";

describe("GroupChatMessages", () => {
  describe("publication", () => {
    const groupId = "5dbf3bec62";
    const roleId = SystemRoles.Team.id;

    const defaultArgs = {
      publication: "groupChatMessages",
      args: [groupId, roleId],
      collectionName: "GroupChatMessages",
    };

    it("should only allow access for authenticated users", () => {
      expectNoDataReturnedFromPublication(defaultArgs);
    });

    it("should not allow access for authenticated users who are not members of the group", () => {
      cy.login("Bob");

      expectNoDataReturnedFromPublication(defaultArgs);
    });

    it("should not allow access for instance admins who are not members of the group", () => {
      cy.login("FeeLing");

      expectNoDataReturnedFromPublication(defaultArgs);
    });

    it("should allow access for users who are part of the group coordination-team", () => {
      cy.login("IvanZ");

      expectPublicationReturnsData(defaultArgs);
    });

    it("should allow access for instance admins who are also part of the group coordination-team", () => {
      cy.login("greg");

      expectPublicationReturnsData(defaultArgs);
    });
  });
});
