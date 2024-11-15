import { Mongo } from "meteor/mongo";
import { Events, EventEntity } from "../../events/events";
import { ensure } from "../ensureFixture";
import { events } from "./data";
import { LocalTime } from "/imports/utils/local-time";
import { PublicSettings } from "/imports/utils/PublicSettings";

export function create() {
  // These events are most useful if they show up in the calendar for the
  // current week, so we move them from their original day into this
  // week but keep the weekday.
  let dateOffset = 0;

  events
    // Don't create events that exist already
    .filter((e) => !(e._id && Events.findOne({ _id: e._id })))
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
