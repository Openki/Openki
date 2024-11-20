/* eslint-disable no-await-in-loop */
import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import { EventEntity, Events } from "/imports/api/events/events";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalTime } from "/imports/utils/local-time";
/**
 * Make a number that looks like a human chose it, favouring 2 and 5
 */
function humandistrib(prng: { (): number }): number {
  const factors = [0, 0, 1, 2, 2, 3, 5, 5];
  return (
    factors[Math.floor(Math.random() * factors.length)] * (prng() > 0.7 ? humandistrib(prng) : 1) +
    (prng() > 0.5 ? humandistrib(prng) : 0)
  );
}

/**
 * Generate events for each course
 *
 * For each course, zero or more events are generated. Some will be in
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

  for (const course of await Courses.find().fetchAsync()) {
    const eventCount = Math.floor((prng() * 1.6) ** 10);
    for (let n = 0; n < eventCount; n += 1) {
      const event = {} as Mongo.OptionalId<EventEntity>;
      let { description } = course;
      if (!description) description = "No description"; // :-(
      const words = _.shuffle(description.split(" "));
      event.tenant = course.tenant;
      event.region = course.region;
      event.groups = course.groups;
      event.groupOrganizers = [];

      const venue = testVenues[Math.floor(prng() * testVenues.length)];
      event.venue = await ensure.venue(venue, event.region);

      if (prng() > 0.6) {
        event.room = rooms[Math.floor(prng() * rooms.length)];
      }

      event.internal = prng() < 0.07;
      event.sendReminder = PublicSettings.sendReminderPreset;

      event.courseId = course._id;
      event._id = ensure.fixedId([course._id, `${n}`]);
      event.title = `${course.name} ${_.sample(words)}`;
      event.description = HtmlTools.saneHtml(
        words.slice(0, 10 + Math.floor(prng() * 30)).join(" "),
      );
      event.groups = course.groups;

      let relativeDate = prng() - 0.7; // put 70% in the past, linear distribution

      // exponential decrease for events in the future
      if (relativeDate > 0) {
        relativeDate = (relativeDate * 5) ** 2;
      }

      const spread = 1000 * 60 * 60 * 24 * 365 * 1.24; // 1.2 years in ms
      const timeOffset = Math.floor(relativeDate * spread);
      const date = new Date(new Date().getTime() + timeOffset);
      const hour = date.getHours();

      // Events outside daylight 8-21 should be unlikely
      if (prng() > 0.2 && (hour < 8 || hour > 21)) {
        date.setHours(hour + 12);
      }

      // Quarter hours should be most common
      if (prng() > 0.05) {
        date.setMinutes(Math.floor(date.getMinutes() / 15) * 15);
      }

      const regionZone = LocalTime.zone(event.region);

      event.startLocal = LocalTime.toString(date);
      event.start = regionZone.fromString(event.startLocal).toDate();
      event.endLocal = LocalTime.toString(
        new Date(date.getTime() + humandistrib(prng) * 1000 * 60 * 4),
      );
      event.end = regionZone.fromString(event.endLocal).toDate();

      const { members } = course;
      const randomMember = members[Math.floor(Math.random() * members.length)];
      event.createdBy = (await ensure.user(randomMember?.user || "Serverscript", event.region))._id;
      const age = Math.floor(prng() * 10000000000);
      event.time_created = new Date(new Date().getTime() - age);
      event.time_lastedit = new Date(new Date().getTime() - age * 0.25);
      await Events.insertAsync(event);
    }

    count += eventCount;
  }

  return `Generated ${count} course events.`;
}
