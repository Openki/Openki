import { assert } from "chai";
import { Router } from "meteor/iron:router";
import $ from "jquery";
import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";
import { Session } from "meteor/session";
import { waitFor, waitForSubscriptions } from "../utils/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("Events map", function () {
    this.timeout(30000);
    before(async function () {
      this.timeout(8000);

      await MeteorAsync.loginWithPassword("greg", "greg");
      Session.set("locale", "en");
      Session.set("region", "all");
    });

    it("should be navigable", async () => {
      const haveTitle = () => {
        assert($("h1").text().includes("Events"), "Title is present");
      };

      Router.go("eventsMap");
      await waitForSubscriptions();
      await waitFor(haveTitle);
    });
  });
}
