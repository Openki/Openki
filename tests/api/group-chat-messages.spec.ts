import { SystemRoles } from "../../imports/api/groups/lib/Role";
import {
  expectNoDataReturnedFromPublication,
  expectPublicationReturnsData,
} from "../support/publication-test-utils";

describe("GroupChatMessages", () => {
  describe("publication", () => {
    const groupId = "5dbf3bec62"; // "Elektronik" group in "Testistan" region
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

  const methodName = "groupChatMessages.send";

  describe.only(`method ${methodName}`, () => {
    const groupId = "c294d35055"; // Group "Deutschkurs" in region "Testistan"
    const roleId = SystemRoles.Team.id;

    it("should throw an error if the user is not signed in", () => {
      cy.expectCallMethodThrowsError(methodName, {
        content: "hello",
        groupId,
        roleId,
      });
    });

    it("should throw an error if the user is signed in but not part of the group or the group role chat", () => {
      cy.login("Bob");
      cy.expectCallMethodThrowsError(methodName, {
        content: "hello",
        groupId,
        roleId,
      });
    });

    it("should throw an error if the user is a group member but not part of the group chat for the specific roleId", () => {
      cy.login("Barbie92");
      cy.expectCallMethodThrowsError(methodName, {
        content: "hello",
        groupId,
        roleId,
      });
    });

    it.only("should only allow group team members to send messages in the team chat when there are at least two participants in the chat", () => {
      cy.login("IvanZ");

      const userId = "itqnv9HJgc3msz5op"; // Group member "Etha Eis"

      cy.callMethodAndIgnoreErrors("groups.removeMemberFromTeam", groupId, userId);

      cy.expectCallMethodThrowsError(methodName, {
        content: "Talking to myself",
        groupId,
        roleId,
      });

      // Make group member "Etha Eis" into a team member
      cy.callMethodAsync("groups.addMemberToTeam", groupId, userId);

      // Now we can send messages as expected because there are two team members
      cy.callMethodAsync(methodName, {
        content: "Talking with a friend",
        groupId,
        roleId,
      });
    });

    it("should not allow access for instance admins who are not part of the group coordination team", () => {
      cy.login("FeeLing");
      cy.expectCallMethodThrowsError(methodName, {
        content: "hello",
        groupId,
        roleId,
      });
    });
  });
});
