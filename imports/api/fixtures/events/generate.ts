import { Mongo } from "meteor/mongo";
import { shuffle, sample } from "lodash-es";

import { Groups } from "../../groups/groups";
import { EventEntity, Events } from "/imports/api/events/events";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalTime } from "/imports/utils/local-time";
import { Log } from "../../log/log";

/**
 * Make a number that looks like a human chose it, favouring 2 and 5
 */
function humandistrib(prng: () => number): number {
  const factors = [0, 0, 1, 2, 2, 3, 5, 5];
  return (
    factors[Math.floor(Math.random() * factors.length)] * (prng() > 0.7 ? humandistrib(prng) : 1) +
    (prng() > 0.5 ? humandistrib(prng) : 0)
  );
}

/**
 * Generate events for each group
 *
 * For each group, zero or more events are generated. Some will be in
 * the past, some in the future.
 */
export async function generate() {
  const prng = Prng("eventsGenerate");
  let count = 0;

  const testVenues = [
    "Haus am See",
    "Kongresszentrum",
    "Volkshaus",
    "SQ131",
    "Caffee Zähringer",
    "Restaurant Krone",
    "Hischengraben 3",
    "SQ125",
    "Hub",
    "ASZ",
    "ASZ",
  ];

  const rooms = [
    "Grosser Saal",
    "Vortragsraum",
    "Erkerzimmer",
    "Mirror-room",
    "Garden",
    "5",
    "Moscow",
    "Moscow",
  ];

  for (const group of await Groups.find().fetchAsync()) {
    if ((await Events.countDocuments({ groupId: group._id })) > 0) {
      continue;
    }

    const eventCount = Math.floor((prng() * 1.6) ** 10);
    for (let n = 0; n < eventCount; n += 1) {
      const event = {} as Mongo.OptionalId<EventEntity>;
      let { description } = group;
      if (!description) description = "No description"; // :-(
      const words = shuffle(description.split(" "));
      event.tenant = group.tenant;
      event.region = group.region;
      event.organizations = group.organizations;
      event.teamOrganizations = [];

      const venue = await ensure.venue(
        testVenues[Math.floor(prng() * testVenues.length)],
        event.region,
      );

      event.venue = {
        _id: venue._id,
        name: venue.name,
        loc: venue.loc,
        address: venue.address,
        editor: venue.editor,
      };

      if (venue.level !== undefined) {
        event.venue.level = venue.level;
      }

      if (venue.restrictedUse !== undefined) {
        event.venue.restrictedUse = venue.restrictedUse;
      }

      if (prng() > 0.6) {
        event.room = rooms[Math.floor(prng() * rooms.length)];
      }

      event.internal = prng() < 0.07;
      event.sendReminder = PublicSettings.sendReminderPreset;

      event.groupId = group._id;
      event._id = ensure.fixedId([group._id, `${n}`]);
      event.title = `${group.name} ${sample(words)}`;
      event.description = HtmlTools.sanitizeHtml(
        words.slice(0, 10 + Math.floor(prng() * 30)).join(" "),
      );
      event.organizations = group.organizations;

      let relativeDate = prng() - 0.7; // put 70% in the past, linear distribution

      // exponential decrease for events in the future
      if (relativeDate > 0) {
        relativeDate = (relativeDate * 5) ** 2;
      }

      const spread = 1000 * 60 * 60 * 24 * 365 * 1.24; // 1.2 years in ms
      const timeOffset = Math.floor(relativeDate * spread);
      const date = new Date(Date.now() + timeOffset);
      const hour = date.getHours();

      // Events outside daylight 8-21 should be unlikely
      if (prng() > 0.2 && (hour < 8 || hour > 21)) {
        date.setHours(hour + 12);
      }

      // Quarter hours should be most common
      if (prng() > 0.05) {
        date.setMinutes(Math.floor(date.getMinutes() / 15) * 15);
      }

      const regionZone = await LocalTime.zoneAsync(event.region);

      event.startLocal = LocalTime.toString(date);
      event.start = regionZone.fromString(event.startLocal).toDate();
      event.endLocal = LocalTime.toString(
        new Date(date.getTime() + humandistrib(prng) * 1000 * 60 * 4),
      );
      event.end = regionZone.fromString(event.endLocal).toDate();

      const { members } = group;
      const randomMember = members[Math.floor(Math.random() * members.length)];
      event.createdBy = (await ensure.user(randomMember?.user || "Serverscript", event.region))._id;
      const age = Math.floor(prng() * 10000000000);
      event.time_created = new Date(Date.now() - age);
      event.time_lastedit = new Date(Date.now() - age * 0.25);
      await Events.insertAsync(event);
    }

    count += eventCount;
  }

  Log.record("testdata", ["Events"], { message: `Generated ${count} group events.` });
}
