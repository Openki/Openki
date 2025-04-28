import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";

import { expectText } from "/imports/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("profile page", function () {
    before(async function () {
      this.timeout(8000);
      // A previous test might have logged us in.
      if (Meteor.userId()) {
        await MeteorAsync.logout();
      }
      await MeteorAsync.loginWithPassword("Kopf", "greg");
      
      Router.go("profile");
    });

    it("should be navigable", async () => {
      await expectText("h1", "Account settings", "Title is present");
    });

    it('should show "My organizations" if user is admin of one', async () => {
      await expectText("h3", "My organizations", "Title is present");
    });
  });
}
