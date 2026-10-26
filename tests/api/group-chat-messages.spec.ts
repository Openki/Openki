import { SystemRoles } from "../../imports/api/groups/lib/Role";
import { getMeteorCollection } from "../support/getMeteorCollection";
import { type GroupChatMessages } from "/imports/api/group-chat-messages/group-chat-messages";

describe("group-chat-messages - publications", () => {
  describe("publication", () => {
    const groupId = "5dbf3bec62";
    const roleId = SystemRoles.Team.id;

    it("should only allow access for authenticated users", () => {
      cy.testSubscription("groupChatMessages", groupId, roleId).then(({ subscription, Meteor }) => {
        const collection = getMeteorCollection<typeof GroupChatMessages>(
          "GroupChatMessages",
          Meteor,
        );

        expect(collection.find().fetch()).length(0);

        subscription.stop();
      });
    });

    it("should not allow access for authenticated users who are not members of the group", () => {
      cy.login("Bob");

      cy.testSubscription("groupChatMessages", groupId, roleId).then(({ subscription, Meteor }) => {
        const collection = getMeteorCollection<typeof GroupChatMessages>(
          "GroupChatMessages",
          Meteor,
        );

        expect(collection.find().fetch()).length(0);

        subscription.stop();
      });
    });

    it("should not allow access for instance admins who are not members of the group", () => {
      cy.login("FeeLing");

      cy.testSubscription("groupChatMessages", groupId, roleId).then(({ subscription, Meteor }) => {
        const collection = getMeteorCollection<typeof GroupChatMessages>(
          "GroupChatMessages",
          Meteor,
        );

        expect(collection.find().fetch()).length(0);

        subscription.stop();
      });
    });

    it("should allow access for users who are part of the group coordination-team", () => {
      cy.login("IvanZ");

      cy.testSubscription("groupChatMessages", groupId, roleId).then(({ subscription, Meteor }) => {
        const collection = getMeteorCollection<typeof GroupChatMessages>(
          "GroupChatMessages",
          Meteor,
        );

        expect(collection.find().fetch().length).to.be.above(0);

        subscription.stop();
      });
    });

    it("should allow access for instance admins who are also part of the group coordination-team", () => {
      cy.login("greg");

      cy.testSubscription("groupChatMessages", groupId, roleId).then(({ subscription, Meteor }) => {
        const collection = getMeteorCollection<typeof GroupChatMessages>(
          "GroupChatMessages",
          Meteor,
        );

        expect(collection.find().fetch().length).to.be.above(0);

        subscription.stop();
      });
    });
  });
});
