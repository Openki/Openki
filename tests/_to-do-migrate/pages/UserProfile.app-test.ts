import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";
import { Session } from "meteor/session";
import {
  expectText,
  expectElement,
  expectNoneElement,
  expectHtmlButton,
} from "../../../../tests/_to-do-migrate/utils/ClientUtils.app-test";

import { Users } from "/imports/api/users/users";

if (Meteor.isClient) {
  describe("userprofile page", function () {
    this.timeout(30000);
    before(async function () {
      this.timeout(8000);
      Session.set("locale", "en");
      Session.set("region", "all");

      // A previous test might have logged us in.
      if (Meteor.userId()) {
        await MeteorAsync.logout();
      }

      (await MeteorAsync.subscribe("userSearch", "Sandro")).stop(); // load user from server
      const user = Users.findOne({ username: "Sandro" });
      Router.go("userprofile", user);
    });

    it("should be navigable", async () => {
      await expectText("h1", "s Profile", "Title is present");
    });

    it('should allow admins to set "User has contributed"', async () => {
      await expectNoneElement(".js-has-contributed", "Button is not present");

      await MeteorAsync.loginWithPassword("greg", "greg");

      const button = await expectHtmlButton(".js-has-contributed", "Button is present");

      button.click();

      expectElement(
        'a[data-bs-title^="Sandro supported Hmmm with a donation."] i.fa-solid.fa-heart',
        "Icon is present",
      );
    });

    it('should allow admins to unset "User has contributed"', async () => {
      await expectNoneElement(".js-has-contributed", "Button is not present");

      await MeteorAsync.loginWithPassword("greg", "greg");

      const button = await expectHtmlButton(".js-has-contributed", "Button is present");

      button.click();

      expectNoneElement(
        'a[data-bs-title^="Sandro supported Hmmm with a donation."] i.fa-solid.fa-heart',
        "Icon is not present",
      );
    });
  });
}
