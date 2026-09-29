import { Events, EventEntity } from "../../events/events";
import { Log } from "../../log/log";
import { ensure } from "../ensureFixture";
import { events as eventsNhw } from "./nachhaltigkeitswoche";
import { events as eventsZuerichlernt } from "./zuerichlernt";
import { LocalTime } from "/imports/utils/local-time";
import { PublicSettings } from "/imports/utils/PublicSettings";
import * as StringTools from "/imports/utils/string-tools";

async function mapSync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> {
  const result = [];
  let i = 0;
  for (const item of array) {
    result.push(await callbackfn(item, i, array));
    i += 1;
  }

  return result;
}

function mapAsync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> {
  return Promise.all(array.map(callbackfn));
}

async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((_value, index) => filterMap[index]);
}

export async function create() {
  // These events are most useful if they show up in the calendar for the
  // current week, so we move them from their original day into this
  // week but keep the weekday.
  let dateOffset = 0;

  for (const template of await filterAsync(
    eventsNhw,
    // Don't create events that exist already
    async (e) => !(e._id && (await Events.findOneAsync({ _id: e._id }))),
  )) {
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
    const regionZone = await LocalTime.zoneAsync(template.region);

    const event = {
      _id: template._id,
      region: template.region,
      title: template.title,
      slug: StringTools.slug(template.title),
      description: template.description,
      categories: template.categories,
      startLocal,
      endLocal,
      venue: await ensure.venue(template.venue, template.region),
      room: template.room || "",
      createdBy: (await ensure.user(template.createdBy, template.region))._id,
      time_created: new Date(template.time_created.$date),
      time_lastedit: new Date(template.time_lastedit.$date),
      groupId: template.groupId,
      internal: template.internal || false,
      sendReminder: PublicSettings.sendReminderPreset,
      organizations: template.organizations?.map((o) => ensure.organization(o)) || [],
      teamOrganizations: [],
      start: regionZone.fromString(startLocal).toDate(),
      end: regionZone.fromString(endLocal).toDate(),
    } as unknown as EventEntity;

    event.venue = {
      _id: (event.venue as any)?._id,
      name: event.venue?.name,
      loc: event.venue?.loc,
      level: event.venue?.level,
      address: event.venue?.address,
      editor: (event.venue as any)?.editor,
    } as any;

    await Events.insertAsync(event);
  }

  // These events are most useful if they show up in the calendar for the
  // current week, so we move them from their original day into this
  // week, the first event starts two days before.
  dateOffset = 0;

  for (const template of eventsZuerichlernt) {
    // We place the first event in the series on the monday of this week
    // and all later events relative to it.
    if (dateOffset === 0) {
      const begining = new Date();
      begining.setHours(0);
      begining.setMinutes(0);
      begining.setSeconds(0);
      begining.setDate(begining.getDate() - 2);

      const dayOfFirstEvent = new Date(template.start.$date);
      dayOfFirstEvent.setHours(0);
      dayOfFirstEvent.setMinutes(0);
      dayOfFirstEvent.setSeconds(0);
      dateOffset = begining.getTime() - dayOfFirstEvent.getTime();
    }

    const startLocal = LocalTime.toString(
      new Date(new Date(template.start.$date).getTime() + dateOffset),
    );
    const endLocal = LocalTime.toString(
      new Date(new Date(template.end.$date).getTime() + dateOffset),
    );
    const regionZone = await LocalTime.zoneAsync(template.region);

    const event = {
      _id: template._id,
      region: template.region,
      title: template.title,
      slug: StringTools.slug(template.title),
      description: template.description,
      categories: template.categories,
      startLocal,
      endLocal,
      venue: template.venue._id
        ? await ensure.venue(template.venue.name, template.region, template.venue._id)
        : { name: template.venue.name },
      room: template.room || "",
      createdBy: (await ensure.user(template.createdBy, template.region))._id,
      time_created: new Date(template.time_created.$date),
      time_lastedit: new Date(template.time_lastedit.$date),
      groupId: template.groupId,
      internal: template.internal || false,
      sendReminder: template.sendReminder,
      canceled: template.canceled,
      organizations: template.organizations || [],
      teamOrganizations: [],
      participants: template.participants
        ? await mapSync(template.participants, async (participant) => ({
            ...participant,
            user: (await ensure.user(participant.user, template.region))._id,
          }))
        : [],
      noRsvp: template.noRsvp,
      maxParticipants: template.maxParticipants,
      start: regionZone.fromString(startLocal).toDate(),
      end: regionZone.fromString(endLocal).toDate(),
    } as unknown as Omit<Mongo.OptionalId<EventEntity>, "tenant">;

    await Events.insertAsync(event);
  }

  Log.record("testdata", ["Events"], {
    message: `Inserted ${eventsNhw.length + eventsZuerichlernt.length} event fixtures.`,
  });
}
