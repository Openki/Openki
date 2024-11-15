import { Events, EventEntity } from "../../events/events";
import { ensure } from "../ensureFixture";
import { events } from "./data";
import { LocalTime } from "/imports/utils/local-time";
import { PublicSettings } from "/imports/utils/PublicSettings";
import * as StringTools from "/imports/utils/string-tools";

export async function create() {
  // These events are most useful if they show up in the calendar for the
  // current week, so we move them from their original day into this
  // week but keep the weekday.
  let dateOffset = 0;

  for (const template of events
    // Don't create events that exist already
    .filter((e) => !(e._id && Events.findOne({ _id: e._id })))) {
    // We place the first event in the series on the monday of this week
    // and all later events relative to it.
    if (dateOffset === 0) {
      const weekstart = new Date();
      weekstart.setHours(0);
      weekstart.setMinutes(0);
      weekstart.setSeconds(0);
      weekstart.setDate(weekstart.getDate() - weekstart.getDay() + 1);

      const dayOfFirstEvent = new Date(template.start.$date);
      dayOfFirstEvent.setHours(0);
      dayOfFirstEvent.setMinutes(0);
      dayOfFirstEvent.setSeconds(0);
      dateOffset = weekstart.getTime() - dayOfFirstEvent.getTime();
    }

    const startLocal = LocalTime.toString(new Date(template.start.$date + dateOffset));
    const endLocal = LocalTime.toString(new Date(template.end.$date + dateOffset));
    const regionZone = LocalTime.zone(template.region);

    const event = {
      _id: template._id,
      region: template.region,
      title: template.title,
      slug: StringTools.slug(template.title),
      description: template.description,
      categories: template.categories,
      startLocal,
      endLocal,
      venue: ensure.venue(template.venue, template.region),
      room: template.room || "",
      createdBy: ensure.user(template.createdBy, template.region)._id,
      time_created: new Date(template.time_created.$date),
      time_lastedit: new Date(template.time_lastedit.$date),
      courseId: template.courseId,
      internal: template.internal || false,
      sendReminder: PublicSettings.sendReminderPreset,
      groups: template.groups?.map((g) => ensure.group(g)) || [],
      groupOrganizers: [],
      start: regionZone.fromString(startLocal).toDate(),
      end: regionZone.fromString(endLocal).toDate(),
    } as unknown as EventEntity;

    // eslint-disable-next-line no-await-in-loop
    await Events.insertAsync(event);
  }

  return `Inserted ${events.length} event fixtures.`;
}
