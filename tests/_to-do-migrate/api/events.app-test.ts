import { Meteor } from "meteor/meteor";
import { assert } from "chai";
import moment from "moment";

import { Events } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { MeteorAsync } from "/imports/utils/promisify";
import { GroupModel, Groups } from "../../../imports/api/groups/groups";
import { UserModel } from "/imports/api/users/users";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { Default as RegionDefault } from "/imports/ui/lib/cleaned-region";

if (Meteor.isClient) {
  describe("Event", () => {
    describe("Save", () => {
      it("Stores an event", async function () {
        this.timeout(5000);

        await Meteor.loginWithPasswordAsync("greg", "greg");
        const theFuture = new Date();
        theFuture.setHours(1000);

        const evenLater = new Date();
        evenLater.setHours(1002);

        const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

        const newEvent = {
          title: "Intentionally clever title for a generated test-event",
          description:
            "This space intentionally filled with bland verbiage. You are safe to ignore this. ",
          venue: { name: "Undisclosed place where heavy testing takes place" },
          startLocal: moment(theFuture).format("YYYY-MM-DD[T]HH:mm"),
          endLocal: moment(evenLater).format("YYYY-MM-DD[T]HH:mm"),
          region: regionId,
          internal: true,
        };

        const eventId = (await EventsMethods.save("", newEvent)) as string;

        assert.isString(eventId, "event.save returns an eventId string");

        const event: any = { ...newEvent };
        delete event.region;
        event.title += " No really";
        await EventsMethods.save(eventId, event);
      });

      it("Sanitizes event strings", async function () {
        this.timeout(5000);

        const titleWithExcessiveWhitespace = " 1  2     3	4      \n";
        const expectedTitle = "1 2 3 4";
        const textWithNonPrintables = "See what's hidden in your string… or behind﻿";
        const expectedText = "See what's hidden in your string… or behind";

        await Meteor.loginWithPasswordAsync("greg", "greg");
        const theFuture = new Date();
        theFuture.setHours(1000);

        const evenLater = new Date();
        evenLater.setHours(1002);

        const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

        const newEvent = {
          title: titleWithExcessiveWhitespace,
          description: textWithNonPrintables,
          venue: { name: "Undisclosed place where heavy testing takes place" },
          startLocal: moment(theFuture).format("YYYY-MM-DD[T]HH:mm"),
          endLocal: moment(evenLater).format("YYYY-MM-DD[T]HH:mm"),
          region: regionId,
        };

        const eventId = await EventsMethods.save("", newEvent);

        const handle = await MeteorAsync.subscribe("event", eventId);
        handle.stop();

        const event = Events.findOne(eventId);

        assert.equal(event?.title, expectedTitle);
        assert.equal(event?.description, expectedText);
      });

      it("Updates time_lastedit from group", async function () {
        this.timeout(5000);

        await Meteor.loginWithPasswordAsync("greg", "greg");

        const groupId = "eb6aedecf9";

        const handle = await MeteorAsync.subscribe("groupDetails", groupId);
        try {
          const oldGroup = Groups.findOne(groupId);

          const theFuture = new Date();
          theFuture.setHours(1000);

          const evenLater = new Date();
          evenLater.setHours(1002);

          const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

          const newEvent = {
            groupId,
            title: "Intentionally clever title for a generated test-event",
            description: "Nothing special here.",
            venue: { name: "Undisclosed place where heavy testing takes place" },
            startLocal: moment(theFuture).format("YYYY-MM-DD[T]HH:mm"),
            endLocal: moment(evenLater).format("YYYY-MM-DD[T]HH:mm"),
            region: regionId,
            internal: true,
          };

          await EventsMethods.save("", newEvent);

          const newGroup = Groups.findOne(groupId);

          assert.isAbove(
            (newGroup as GroupModel).time_lastedit.getTime(),
            (oldGroup as GroupModel).time_lastedit.getTime(),
          );
        } finally {
          handle.stop();
        }
      });
    });

    describe("Find by filter", () => {
      before(async function () {
        this.timeout(8000);

        // A previous test might have logged us in.
        if (Meteor.userId()) {
          await Meteor.logoutAsync();
        }
        Session.set("region", RegionDefault);

        await MeteorAsync.subscribe("Events.findFilter");
      });

      it("should a gast only show events from public tenants", async function () {
        this.timeout(6000);

        const eventsAsGast = Events.findFilter().fetch();

        assert.isNotEmpty(eventsAsGast, "shows events");

        assert.isEmpty(
          eventsAsGast.filter((e) => e.tenant && !PublicSettings.publicTenants.includes(e.tenant)),
          "don't show events from not public",
        );
      });

      it("should allow a logged in user to see events from their tenant", async function () {
        this.timeout(6000);

        const eventsAsGast = Events.findFilter().fetch();

        await Meteor.loginWithPasswordAsync("Schufien", "greg");
        const schufien = (await Meteor.userAsync()) as UserModel;

        assert.ok(schufien);

        const eventsAsSchufien = Events.findFilter().fetch();

        assert.includeMembers(
          eventsAsSchufien.map((e) => e._id),
          eventsAsGast.map((e) => e._id),
          "shows public events as logged in user",
        );

        assert.isTrue(
          eventsAsSchufien.length > eventsAsGast.length,
          "shows private events as logged in user",
        );
        assert.isNotEmpty(
          eventsAsSchufien.filter(
            (e) => e.tenant && schufien.tenants.some((t) => t._id === e.tenant),
          ),
          "shows private events as logged in user",
        );
      });
    });
  });
}
