import { assert } from "chai";
import { Router } from "meteor/iron:router";
import $ from "jquery";
import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";
import { Session } from "meteor/session";

import { Venues } from "/imports/api/venues/venues";

import {
  waitForSubscriptions,
  waitFor,
} from "../../../../tests/_to-do-migrate/utils/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("venue details page", function () {
    this.timeout(30000);
    before(async function () {
      this.timeout(8000);
      Session.set("locale", "en");
      Session.set("region", "all");
    });

    it("should be navigable", async () => {
      const haveTitle = () => {
        assert($("h3").text().includes("Hischengraben 3"), "Title is present");
      };

      (await MeteorAsync.subscribe("Venues.findFilter", { search: "Hischengraben 3" })).stop(); // load venue from server
      const venueId = Venues.findOne({ name: "Hischengraben 3" })?._id;
      Router.go("venueDetails", { _id: venueId, username: "Hischengraben 3" });

      await waitForSubscriptions();
      await waitFor(haveTitle);
    });
  });
}
