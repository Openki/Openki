import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import {
  CourseDiscussionEnity,
  CourseDiscussions,
} from "/imports/api/course-discussions/course-discussions";
import { EventEntity, Events } from "/imports/api/events/events";
import { ensure } from "/imports/api/fixtures/ensureFixture";
import { Prng } from "/imports/api/fixtures/Prng";
import { GroupEntity, Groups } from "/imports/api/groups/groups";
import { RegionEntity, Regions } from "/imports/api/regions/regions";
import { Venues } from "/imports/api/venues/venues";
import { Users } from "/imports/api/users/users";
import { InfoPages } from "/imports/api/infoPages/infoPages";
import { infoPages } from "./data/infoPages/infoPages";

import { PublicSettings } from "/imports/utils/PublicSettings";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalTime } from "/imports/utils/local-time";
import { PrivateSettings } from "/imports/utils/PrivateSettings";

import { events } from "./data/event.fixtures";
import { groups } from "./data/group.fixtures";
import { regions } from "./data/region.fixtures";
import { venues } from "./data/venue.fixtures";

import { create as coursesCreate } from "./courses/create";

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
 * Select a date that is after the given date
 * For past dates a date between the original date and the present is chosen,
 * dates closer to the original date preferred.
 * For future dates, a date between the original date and double the time between now and then
 * is chosen.
 */
function sometimesAfter(date: Date) {
  const prng = Prng("sometimesAfter");

  // Seconds between then and now
  const spread = new Date(Math.abs(new Date().getTime() - date.getTime())).getTime();

  // Quadratic dropoff: Place new date closer to the original date statistically
  const placement = prng();
  const squaredPlacement = placement * placement;

  return new Date(date.getTime() + spread * squaredPlacement);
}

function regionsCreate() {
  const userKopf = ensure.user("Kopf", undefined, true)._id;

  const prng = Prng("createRegions");
  regions.forEach((r) => {
    const region = {
      ...r,
      tenant: prng() > 0.3 ? ensure.tenant("Hmmm") : ensure.tenant("Kopf", userKopf),
    } as unknown as RegionEntity; // clone
    if (r.loc) {
      const coordinates = r.loc.reverse(); // GeoJSON takes latitude first
      region.loc = { type: "Point", coordinates: coordinates as [long: number, lat: number] };
    }
    Regions.insert(region);
  });

  return `Inserted ${regions.length} region fixtures.`;
}

function usersCreate() {
  ensure.user("greg", undefined, true);
  ensure.user("Seee", undefined, true);
  ensure.user("1u", undefined, true);
  ensure.user("validated_mail", undefined, true);
  return "Inserted user fixtures.";
}

function infoPagesCreate() {
  infoPages.forEach((p) => {
    InfoPages.insert(p);
  });
  return "Inserted info pages fixtures.";
}

function groupsCreate() {
  groups.forEach((g) => {
    const group = { ...g } as unknown as Mongo.OptionalId<GroupEntity>;
    group.createdby = "ServerScript_loadingTestgroups";

    // Always use same id for same group to avoid broken urls while testing
    group._id = ensure.fixedId([group.name, group.description]);
    group.members =
      g.members?.map((name) => ({ user: ensure.user(name, undefined)._id, notify: true })) || [];
    Groups.insert(group);
  });

  return `Inserted ${groups.length} group fixtures.`;
}

function eventsCreate() {
  // These events are most useful if they show up in the calendar for the
  // current week, so we move them from their original day into this
  // week but keep the weekday.
  let dateOffset = 0;

  events
    // Don't create events that exist already
    .filter((e) => !Events.findOne({ _id: e._id }))
    .forEach((e) => {
      const event = { ...e } as unknown as Mongo.OptionalId<EventEntity>;
      event.createdBy = ensure.user(e.createdBy, e.region)._id;
      event.groups = e.groups?.map(ensure.group) || [];
      event.groupOrganizers = [];

      // We place the first event in the series on the monday of this week
      // and all later events relative to it.
      if (dateOffset === 0) {
        const weekstart = new Date();
        weekstart.setHours(0);
        weekstart.setMinutes(0);
        weekstart.setSeconds(0);
        weekstart.setDate(weekstart.getDate() - weekstart.getDay() + 1);

        const dayOfFirstEvent = new Date(e.start.$date);
        dayOfFirstEvent.setHours(0);
        dayOfFirstEvent.setMinutes(0);
        dayOfFirstEvent.setSeconds(0);
        dateOffset = weekstart.getTime() - dayOfFirstEvent.getTime();
      }

      event.venue = ensure.venue(e.venue, e.region);
      event.internal = Boolean(e.internal);
      event.sendReminder = PublicSettings.sendReminderPreset;

      const regionZone = LocalTime.zone(e.region);

      event.startLocal = LocalTime.toString(new Date(e.start.$date + dateOffset));
      event.start = regionZone.fromString(event.startLocal).toDate();
      event.endLocal = LocalTime.toString(new Date(e.end.$date + dateOffset));
      event.end = regionZone.fromString(event.endLocal).toDate();
      event.time_created = new Date(e.time_created.$date);
      event.time_lastedit = new Date(e.time_lastedit.$date);
      Events.insert(event);
    });

  return `Inserted ${events.length} event fixtures.`;
}

function venuesCreate() {
  const prng = Prng("loadLocations");

  const testRegions = [
    Regions.findOne("9JyFCoKWkxnf8LWPh"),
    Regions.findOne("EZqQLGL4PtFCxCNrp"),
  ].map((r) => {
    if (!r) {
      throw new Error("Unexpected undefined");
    }
    return r._id;
  });

  venues.forEach((v) => {
    const venueData = { ...v };
    venueData.region = prng() > 0.85 ? testRegions[0] : testRegions[1];

    const venue = ensure.venue(venueData.name, venueData.region);

    _.extend(venue, venueData);

    venue.createdby = ensure.user(venue.createdby, venueData.region)._id;

    Venues.update(venue._id, venue);
  });

  return `Inserted ${venues.length} venue fixtures.`;
}

/**
 * Generate events for each course
 *
 * For each course, zero or more events are generated. Some will be in
 * the past, some in the future.
 */
function eventsGenerate() {
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

  Courses.find().forEach((course) => {
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
      event.venue = ensure.venue(venue, event.region);

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
      event.createdBy = ensure.user(randomMember?.user || "Serverscript", event.region)._id;
      const age = Math.floor(prng() * 10000000000);
      event.time_created = new Date(new Date().getTime() - age);
      event.time_lastedit = new Date(new Date().getTime() - age * 0.25);
      Events.insert(event);
    }

    count += eventCount;
  });

  return `Generated ${count} course events.`;
}

function commentsGenerate() {
  const prng = Prng("createComments");
  let count = 0;

  const userCount = Users.find().count();
  Courses.find().forEach((course) => {
    const createCount = Math.floor((prng() * 2) ** 4);
    const courseMembers = course.members.length;
    let { description } = course;
    if (!description) description = "No description"; // :-(
    const words = description.split(" ");

    for (let n = 0; n < createCount; n += 1) {
      const comment = {} as Mongo.OptionalId<CourseDiscussionEnity>;
      comment.courseId = course._id;
      comment.title = _.sample(words, 1 + Math.floor(prng() * 3)).join(" ");
      comment.text = HtmlTools.saneHtml(
        _.sample(words, 5).join(" ") + _.sample(words, Math.floor(prng() * 30)).join(" "),
      );

      comment.time_created = sometimesAfter(course.time_created);
      comment.time_updated =
        prng() < 0.9 ? comment.time_created : sometimesAfter(comment.time_created);

      if (!courseMembers || prng() < 0.2) {
        // Leave some anonymous comments
        if (prng() < 0.7) {
          const user = Users.findOne({}, { skip: Math.floor(prng() * userCount) });
          if (!user) {
            throw new Error("Unexpected undefined");
          }
          comment.userId = user._id;
        }
      } else {
        const commenter = course.members[Math.floor(prng() * courseMembers)];
        comment.userId = commenter.user;
      }

      CourseDiscussions.insert(comment);
    }

    count += createCount;
  });

  return `Generated ${count} course comments.`;
}

// Unfortunately we can't make this a debugOnly package because the integration
// tests use the data too, and they run with the --production flag.
// This guard is here until we find a better solution.
if (Meteor.isServer && PrivateSettings.testdata) {
  Meteor.methods({
    "fixtures.clean"() {
      Groups.remove({});
      Events.remove({});
      Venues.remove({});
      Courses.remove({});
    },

    async "fixtures.create"() {
      infoPagesCreate();
      if (Regions.find().count() === 0) {
        regionsCreate();
      }
      usersCreate();
      groupsCreate();
      venuesCreate();
      await coursesCreate();
      eventsGenerate();
    },
    "fixtures.infoPages.create": infoPagesCreate,
    "fixtures.users.create": usersCreate,
    "fixtures.regions.create": regionsCreate,
    "fixtures.groups.create": groupsCreate,
    "fixtures.events.create": eventsCreate,
    "fixtures.venues.create": venuesCreate,
    "fixtures.courses.create": coursesCreate,
    "fixtures.events.generate": eventsGenerate,
    "fixtures.comments.generate": commentsGenerate,
  });
}
