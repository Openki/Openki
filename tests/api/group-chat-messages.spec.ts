import { SystemRoles } from "../../imports/api/groups/lib/Role";
import { type GroupChatMessages } from "/imports/api/group-chat-messages/group-chat-messages";

describe("group-chat-messages - publications", () => {
  describe("publication", () => {
    const groupId = "5dbf3bec62";
    const roleId = SystemRoles.Team.id;

    it("should only allow access for authenticated users", () => {
      cy.callPublication("groupChatMessages", groupId, roleId).then((subscription) => {
        cy.allSubscriptionsReady();

        cy.getMeteor().then((Meteor) => {
          const store = Meteor.connection._stores[
            "GroupChatMessages"
          ]._getCollection() as typeof GroupChatMessages;

          expect(store.find().fetch()).length(0);

          // Cleanup
          subscription.stop();
          cy.allSubscriptionsReady();
        });
      });
    });

    it("should not allow access for authenticated users who are not members of the group", () => {
      cy.login("Bob");

      cy.callPublication("groupChatMessages", groupId, roleId).then((subscription) => {
        cy.allSubscriptionsReady();

        cy.getMeteor().then((Meteor) => {
          const store = Meteor.connection._stores[
            "GroupChatMessages"
          ]._getCollection() as typeof GroupChatMessages;

          expect(store.find().fetch()).length(0);

          // Cleanup
          subscription.stop();
          cy.allSubscriptionsReady();
        });
      });
    });

    it("should not allow access for instance admins who are not members of the group", () => {
      cy.login("FeeLing");

      cy.callPublication("groupChatMessages", groupId, roleId).then((subscription) => {
        cy.allSubscriptionsReady();

        cy.getMeteor().then((Meteor) => {
          const store = Meteor.connection._stores[
            "GroupChatMessages"
          ]._getCollection() as typeof GroupChatMessages;

          expect(store.find().fetch()).length(0);

          // Cleanup
          subscription.stop();
          cy.allSubscriptionsReady();
        });
      });
    });

    it("should allow access for users who are part of the group coordination-team", () => {
      cy.login("IvanZ");

      cy.callPublication("groupChatMessages", groupId, roleId).then((subscription) => {
        cy.allSubscriptionsReady();

        cy.getMeteor().then((Meteor) => {
          const store = Meteor.connection._stores[
            "GroupChatMessages"
          ]._getCollection() as typeof GroupChatMessages;

          expect(store.find().fetch().length).to.be.above(0);

          // Cleanup
          subscription.stop();
          cy.allSubscriptionsReady();
        });
      });
    });

    it("should allow access for instance admins who are also part of the group coordination-team", () => {
      cy.login("greg");

      cy.callPublication("groupChatMessages", groupId, roleId).then((subscription) => {
        cy.allSubscriptionsReady();

        cy.getMeteor().then((Meteor) => {
          const store = Meteor.connection._stores[
            "GroupChatMessages"
          ]._getCollection() as typeof GroupChatMessages;

          expect(store.find().fetch().length).to.be.above(0);

          // Cleanup
          subscription.stop();
          cy.allSubscriptionsReady();
        });
      });
    });
  });
});
