import { SystemRoles } from "../../imports/api/groups/lib/Role";

describe("group-chat-messages - publications", () => {
  describe("publication", () => {
    const groupId = "5dbf3bec62";
    const roleId = SystemRoles.Team.id;

    it("should only allow access for authenticated users", () => {
      cy.callPublication("groupChatMessages", groupId, roleId);
    });
  });
});
