import { Meteor } from "meteor/meteor";
import { Router } from "meteor/iron:router";
import { assert } from "chai";
import { MeteorAsync } from "/imports/utils/promisify";
import { Session } from "meteor/session";

import { waitForSubscriptions, waitFor } from "/imports/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("Frontpage", function () {
    this.timeout(60000);
    before(async function () {
      // A previous test might have logged us in.
      if (Meteor.userId()) {
        await MeteorAsync.logout();
      }
    });
    beforeEach(async () => {
      await Meteor.callAsync("fixtures.clean.forAppTest");
    });
    beforeEach(async () => {
      await Meteor.callAsync("fixtures.create.forAppTest");
    });
    it("should list 5 courses for unauthenticated user (Testistan)", async () => {
      Router.go("/search");

      Session.set("region", "9JyFCoKWkxnf8LWPh"); // Testistan

      await waitForSubscriptions();
      const titles = await waitFor(() => {
        const t = document.getElementsByClassName("course-compact-title");
        assert.equal(t.length, 5, "expect to see test course titles");
        return t;
      }, 6000);
      await waitFor(() => {
        assert.equal(titles[0].textContent, "Jodeln");
        assert.equal(titles[1].textContent, "Aikido");
        assert.equal(titles[2].textContent, "Verschlafen");
        assert.equal(titles[3].textContent, "Lerne Russisch in 2 Stunden");
        assert.equal(titles[4].textContent, "Deutschkurs");
      });
    });
  });
}
