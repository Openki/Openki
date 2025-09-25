import { assert } from "chai";
import { Router } from "meteor/iron:router";
import $ from "jquery";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { waitForSubscriptions, waitFor } from "../utils/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("Calendar frame page", function () {
    this.timeout(30000);
    before(async function () {
      this.timeout(8000);

      Session.set("locale", "en");
      Session.set("region", "all");
    });

    it("should be navigable", async () => {
      const haveElements = () => {
        assert($(".frame-list-item-event").length > 0, "Events are present.");
      };

      Router.go("frameCalendar");
      await waitForSubscriptions();
      await waitFor(haveElements);
    });
  });
}
