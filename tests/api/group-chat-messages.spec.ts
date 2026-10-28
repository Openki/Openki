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

    before(() => {
      // Reset the group messages before each test so we have a consistent state.
      cy.login("greg");

      cy.window({ log: false }).then(async (window) => {
        // Since we have logged in at this point, the window object should have the Meteor and Accounts globals available.
        // @ts-expect-error Don't care about the missing type.
        const token = window.Accounts._storedLoginToken();

        // The arguments have to be statically duplicated inside the before() hook
        // because this function is executed separately without access to the parent scopes.
        // "c294d35055" = groupId for "Deutschkurs" in region "Testistan"
        // "team" = SystemRoles.Team.id
        const response = await fetch(`/_test_only/group-chat-messages/reset/c294d35055/team`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to reset the group chat messages", { cause: response });
        }
      });
      cy.allSubscriptionsReady();
      cy.logout();
    });

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

    it("should only allow group team members to send messages in the team chat when there are at least two participants in the chat", () => {
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

  describe("UI", () => {
    const groupId = "5dbf3bec62"; // "Elektronik" group in "Testistan" region

    beforeEach(() => {
      // For some reason, calling cy.visitOpenki() with a username doesn't work reliably
      // directly in test cases.
      // Therefore, I used the workaround to first navigate in beforeEach() and then login with the expected user.
      // It's much slower (due to double full page reloads), but it works and I don't want to debug the router/Meteor/Cypress state right now.
      cy.visitOpenki(`/group/${groupId}/elektronik`);
    });

    it("shows the public group discussions for unauthenticated users", () => {
      // cy.visitOpenki(`/group/${groupId}/elektronik`)

      cy.get(".group-role-chat-tabs").should("not.exist");
      cy.getByRole("tab", { name: /team chat/i }).should("not.exist");
      cy.get("#discussion .discussion-conversation").should("be.visible");
    });

    it("shows the public group discussions for users who are not part of the group", () => {
      // cy.visitOpenki(`/group/${groupId}/elektronik`, { username: "Bob" });
      cy.login("Bob");

      cy.get(".group-role-chat-tabs").should("not.exist");
      cy.getByRole("tab", { name: /team chat/i }).should("not.exist");
      cy.get("#discussion .discussion-conversation").should("be.visible");
    });

    it("shows the public group discussions for group members who are not part of the team", () => {
      // cy.visitOpenki(`/group/${groupId}/elektronik`, { username: "Barbie92" });
      cy.login("Barbie92");

      cy.get(".group-role-chat-tabs").should("not.exist");
      cy.getByRole("tab", { name: /team chat/i }).should("not.exist");
      cy.get("#discussion .discussion-conversation").should("be.visible");
    });

    it("shows the team chat for group team members", () => {
      // cy.visitOpenki(`/group/${groupId}/elektronik`, { username: "IvanZ" });
      cy.login("IvanZ");

      cy.get(".group-role-chat-tabs").should("be.visible");
      cy.getByRole("tab", { name: /team chat/i }).should("be.visible");
      cy.get("#discussion .discussion-conversation").should("not.be.visible");
    });
  });
});
