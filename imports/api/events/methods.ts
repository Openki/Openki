import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { i18n } from "/imports/startup/both/i18next";
import { _ } from "meteor/underscore";
import moment from "moment";

import { Courses } from "/imports/api/courses/courses";
import { Subscribe, processChange } from "/imports/api/courses/subscription";
import * as courseHistoryDenormalizer from "/imports/api/courses/historyDenormalizer";
import * as courseTimeLastEditDenormalizer from "/imports/api/courses/timeLastEditDenormalizer";
import * as courseImageDenormalizer from "/imports/api/events/courseImageDenormalizer";
import * as categoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as groupsDenormalizer from "/imports/api/events/groupsDenormalizer";
import * as venueDenormalizer from "/imports/api/events/venueDenormalizer";
import { EventEntity, EventModel, Events, OEvent } from "/imports/api/events/events";
import { Groups } from "/imports/api/groups/groups";
import { Regions } from "/imports/api/regions/regions";

import { Notification } from "../../startup/both/emails/notification";
import { AffectedReplicaSelectors } from "/imports/utils/affected-replica-selectors";
import * as AsyncTools from "/imports/utils/async-tools";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalTime } from "/imports/utils/local-time";
import * as StringTools from "/imports/utils/string-tools";
import * as UpdateMethods from "/imports/utils/update-methods";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { HtmlString, SafeString, StringEnum, Tuple, Type } from "/imports/utils/CustomChecks";
import { GroupPromoters } from "/imports/utils/update-methods";
import { PublicSettings } from "/imports/utils/PublicSettings";

/**
 * @param updateOptions What should be updated
 */
const ReplicaSync = function (
  event: EventEntity,
  updateOptions: {
    infos?: boolean | undefined;
    time?: boolean | undefined;
    changedReplicas?: { time?: boolean | undefined } | undefined;
  },
) {
  let affected = 0;

  const apply = async function (changes: Partial<EventEntity>) {
    const startMoment = moment(changes.start);
    const endMoment = moment(changes.end);
    const timeIsValid = startMoment.isValid() && endMoment.isValid();
    const startTime = { hour: startMoment.hour(), minute: startMoment.minute() };
    const timeDelta = endMoment.diff(startMoment);

    for (const replica of await Events.find(AffectedReplicaSelectors(event)).fetchAsync()) {
      const replicaChanges = updateOptions.infos ? { ...changes } : {};

      const updateTime =
        timeIsValid &&
        updateOptions.time &&
        (replica.sameTime(event) || updateOptions?.changedReplicas?.time);

      if (updateTime) {
        const newStartMoment = moment(replica.start).set(startTime);
        Object.assign(replicaChanges, {
          start: newStartMoment.toDate(),
          end: newStartMoment.add(timeDelta).toDate(),
        });

        const regionZone = LocalTime.zone(replica.region);
        Object.assign(replicaChanges, {
          startLocal: regionZone.toString(replicaChanges.start as Date),
          endLocal: regionZone.toString(replicaChanges.end as Date),
        });
      } else {
        delete replicaChanges.start;
        delete replicaChanges.end;
        delete replicaChanges.startLocal;
        delete replicaChanges.endLocal;
      }

      if (updateOptions.infos || updateTime) {
        // only update if something has changed
        // eslint-disable-next-line no-await-in-loop
        await Events.updateAsync({ _id: replica._id }, { $set: replicaChanges });
      }

      affected += 1;
    }
  };

  return {
    affected() {
      return affected;
    },
    apply,
  };
};

export const GeodataPattern = {
  type: StringEnum("Point"),
  /** (not lat-long !) */
  coordinates: Tuple<[long: NumberConstructor, lat: NumberConstructor]>(Number, Number),
};

export type Geodata = Type<typeof GeodataPattern>;

export const EventVenuePattern = {
  _id: Match.Optional(SafeString()),
  name: Match.Optional(SafeString()),
  loc: Match.Optional(GeodataPattern),
  address: Match.Optional(SafeString()),
  editor: Match.Optional(SafeString()),
};

export const UpdateFieldsPattern = {
  title: SafeString(),
  description: HtmlString(),
  venue: Match.Optional(EventVenuePattern),
  room: Match.Optional(SafeString()),
  startLocal: Match.Optional(SafeString()),
  endLocal: Match.Optional(SafeString()),
  internal: Match.Optional(Boolean),
  sendReminder: Match.Optional(Boolean),
  noRsvp: Match.Optional(Boolean),
  maxParticipants: Match.Optional(Match.Integer),
};
export type UpdateFields = Type<typeof UpdateFieldsPattern>;

export const CreateFieldsPattern = {
  ...UpdateFieldsPattern,
  courseId: Match.Optional(SafeString()),
  region: SafeString(),
  replicaOf: Match.Optional(SafeString()),
  groups: Match.Optional([SafeString()]),
};
export type CreateFields = Type<typeof CreateFieldsPattern>;

export type SaveFields = Partial<CreateFields> & UpdateFields;

/**
 * @param eventId The event id or to create a new event, pass an empty Id
 */
export const save = ServerMethod(
  "event.save",
  async (
    eventId: string,
    changes: SaveFields,
    updateReplicasInfos?: boolean | null,
    updateReplicasTime?: boolean | null,
    updateChangedReplicasTime?: boolean | null,
    sendNotifications?: boolean | null,
    comment?: string | null,
  ) => {
    check(eventId, SafeString());

    const isNew = eventId === "";

    const expectedFields = isNew ? CreateFieldsPattern : UpdateFieldsPattern;
    check(changes, expectedFields);
    check(sendNotifications, Match.Maybe(Boolean));
    check(comment, Match.Maybe(String));

    if (!isNew) {
      check(updateReplicasInfos, Match.Maybe(Boolean));
      check(updateReplicasTime, Match.Maybe(Boolean));
      check(updateChangedReplicasTime, Match.Maybe(Boolean));
    }

    const editFields = changes as Partial<EventEntity>;

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const now = new Date();

    editFields.time_lastedit = now;

    let event: EventModel;
    if (isNew) {
      editFields.time_created = now;
      if (editFields.courseId) {
        const course = await Courses.findOneAsync(editFields.courseId);
        if (!course) {
          throw new Meteor.Error(404, "course not found");
        }
        if (!course.editableBy(user)) {
          throw new Meteor.Error(401, "not permitted");
        }
      }

      if (editFields.replicaOf) {
        const parent = await Events.findOneAsync(editFields.replicaOf);
        if (!parent) {
          throw new Meteor.Error(404, "replica parent not found");
        }
        if (parent.courseId !== editFields.courseId) {
          throw new Meteor.Error(400, "replica must be in same course");
        }
      }

      if (!editFields.startLocal) {
        throw new Meteor.Error(400, "Event date not provided");
      }

      const testedGroups =
        editFields.groups?.map((groupId) => {
          const group = Groups.findOne(groupId);
          if (!group) {
            throw new Meteor.Error(404, `no group with id ${groupId}`);
          }
          return group._id;
        }) || [];
      editFields.groups = testedGroups;

      // Coerce faulty end dates
      if (!editFields.endLocal || editFields.endLocal < editFields.startLocal) {
        editFields.endLocal = editFields.startLocal;
      }

      editFields.internal = !!editFields.internal;
      editFields.sendReminder = PublicSettings.feature.sendReminderIsEditable
        ? !!editFields.sendReminder
        : PublicSettings.sendReminderPreset;

      // Synthesize event document because the code below relies on it
      event = _.extend(new OEvent(), {
        region: editFields.region,
        courseId: editFields.courseId,
        editors: [user._id],
      });
    } else {
      const result = await Events.findOneAsync(eventId);
      if (!result) {
        throw new Meteor.Error(404, "No such event");
      }
      event = result;
    }

    if (!event.editableBy(user)) {
      throw new Meteor.Error(401, "not permitted");
    }

    const region = await Regions.findOneAsync(event.region);

    if (!region) {
      throw new Meteor.Error(400, "Region not found");
    }

    const regionZone = LocalTime.zone(region._id);

    // Don't allow moving past events or moving events into the past
    // This section needs a rewrite even more than the rest of this method
    if (editFields.startLocal) {
      const startMoment = regionZone.fromString(editFields.startLocal);
      if (!startMoment.isValid()) {
        throw new Meteor.Error(400, "Invalid start date");
      }

      if (startMoment.isBefore(new Date())) {
        if (isNew) {
          throw new Meteor.Error(400, "Event start in the past");
        }

        // No changing the date of past events
        delete editFields.startLocal;
        delete editFields.endLocal;
      } else {
        editFields.startLocal = regionZone.toString(startMoment); // Round-trip for security
        editFields.start = startMoment.toDate();

        let endMoment;
        if (editFields.endLocal) {
          endMoment = regionZone.fromString(editFields.endLocal);
          if (!endMoment.isValid()) {
            throw new Meteor.Error(400, "Invalid end date");
          }
        } else {
          endMoment = regionZone.fromString(event.endLocal);
        }

        if (endMoment.isBefore(startMoment)) {
          endMoment = startMoment; // Enforce invariant
        }
        editFields.endLocal = regionZone.toString(endMoment);
        editFields.end = endMoment.toDate();
      }
    }

    // prevent to choose a value which is lower than actual registered participants
    if (editFields.maxParticipants) {
      // if maxParticipants is 0 or no participants registered yet,
      // we dont need this check, 0 means no participant limit.
      if (event.participants && event.maxParticipants) {
        const numParticipantsRegistered = event.numberOfParticipants();
        if (numParticipantsRegistered > editFields.maxParticipants) {
          throw new Meteor.Error(
            400,
            `the minimal possible value is ${numParticipantsRegistered}, ` +
              `because ${numParticipantsRegistered} users have already registered.`,
          );
        }
      }
    }

    if (Meteor.isServer) {
      const sanitizedDescription = StringTools.saneText(editFields.description as string);
      editFields.description = HtmlTools.saneHtml(sanitizedDescription);
    }

    if (editFields.title) {
      editFields.title = StringTools.saneTitle(editFields.title).substring(0, 1000);
      editFields.slug = StringTools.slug(editFields.title);
    }

    let affectedReplicaCount = 0;
    if (isNew) {
      editFields.createdBy = user._id;
      editFields.groupOrganizers = [];
      let enrichedEvent = await courseImageDenormalizer.beforeInsert(editFields as any);
      if (enrichedEvent.courseId) {
        enrichedEvent = await categoriesDenormalizer.beforeInsert(enrichedEvent);
      }
      // eslint-disable-next-line no-param-reassign
      eventId = await Events.insertAsync(enrichedEvent);

      if (editFields.courseId) {
        await courseTimeLastEditDenormalizer.afterEventInsert(editFields.courseId);
        await courseHistoryDenormalizer.afterEventInsert(editFields.courseId, user._id, {
          _id: eventId,
          title: editFields.title as string,
          slug: editFields.slug as string,
          startLocal: editFields.startLocal as string,
        });
      }
    } else {
      await Events.updateAsync(eventId, { $set: editFields });

      if (updateReplicasInfos || updateReplicasTime) {
        const updateOptions = {
          infos: updateReplicasInfos ?? false,
          time: updateReplicasTime ?? false,
          changedReplicas: { time: updateChangedReplicasTime ?? false },
        };
        const replicaSync = ReplicaSync(event, updateOptions);
        await replicaSync.apply(editFields);
        affectedReplicaCount = replicaSync.affected();
      }

      if (event.courseId) {
        await courseHistoryDenormalizer.afterEventUpdate(event.courseId, user._id, {
          _id: eventId,
          title: editFields.title as string,
          slug: editFields.slug as string,
          startLocal: editFields.startLocal as string,
          replicasUpdated: !!(updateReplicasInfos || updateReplicasTime),
        });
      }
    }

    if (sendNotifications) {
      if (affectedReplicaCount) {
        const affectedReplicaMessage = i18n(
          "notification.event.affectedReplicaMessage",
          "These changes have also been applied to {NUM, plural, one{the later copy} other{# later copies} }",
          { NUM: affectedReplicaCount, lng: user.locale },
        );

        if (comment === null || comment === undefined) {
          // eslint-disable-next-line no-param-reassign
          comment = affectedReplicaMessage;
        } else {
          // eslint-disable-next-line no-param-reassign
          comment = `${affectedReplicaMessage}\n\n${comment}`;
        }
      }

      if (comment) {
        // eslint-disable-next-line no-param-reassign
        comment = comment.trim().substring(0, 2000).trim();
      }

      await Notification.Event.record(eventId, isNew, comment || undefined);
    }

    if (Meteor.isServer) {
      await venueDenormalizer.updateVenue(eventId);
      await groupsDenormalizer.updateGroups(eventId);
      Meteor.call("region.updateCounters", event.region, AsyncTools.logErrors);

      // the assumption is that all replicas have the same course if any
      if (event.courseId) {
        Meteor.call("course.updateNextEvent", event.courseId, AsyncTools.logErrors);
      }
    }

    return eventId;
  },
  { simulation: false },
);

export const remove = ServerMethod(
  "event.remove",
  async (eventId: string) => {
    check(eventId, SafeString());

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const event = await Events.findOneAsync(eventId);
    if (!event) {
      throw new Meteor.Error(404, "No such event");
    }

    if (!event.editableBy(user)) {
      throw new Meteor.Error(401, "not permitted");
    }

    await Events.removeAsync(eventId);

    // unlink child replicas
    await Events.updateAsync(
      { replicaOf: event._id },
      { $unset: { replicaOf: true } },
      { multi: true },
    );

    if (event.courseId) {
      await courseHistoryDenormalizer.afterEventRemove(event.courseId, user._id, {
        title: event.title,
        startLocal: event.startLocal,
      });

      await Meteor.callAsync("course.updateNextEvent", event.courseId);
    }
    await Meteor.callAsync("region.updateCounters", event.region);
  },
  { simulation: false },
);

/**
 * Add or remove a group from the groups list
 *
 * @param eventId The event to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const promote = ServerMethod(
  "event.promote",
  UpdateMethods.promote(Events as unknown as GroupPromoters),
);

/**
 * Add or remove a group from the groupOrganizers list
 *
 * @param eventId The event to update
 * @param groupId The group to add or remove
 * @param add Whether to add or remove the group
 *
 */
export const editing = ServerMethod(
  "event.editing",
  UpdateMethods.editing(Events as unknown as GroupPromoters),
);

/**
 * Add current user as event-participant
 *
 * the user is also signed up for the course.
 */
export const addParticipant = ServerMethod(
  "event.addParticipant",
  /**
   * @param eventId The event to register for
   */
  async function (eventId: string, companions: number) {
    check(eventId, SafeString());
    check(companions, Number);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error(401, "please log in");
    }

    const event = await Events.findOneAsync(eventId);
    // ignore broken eventIds
    if (!event) {
      return;
    }

    // dont allow participant-mutations if event has passed
    if (moment().isAfter(event.end)) {
      throw new Meteor.Error(401, "cannot register, event has already passed");
    }

    await Events.updateAsync(
      { _id: eventId },
      { $addToSet: { participants: { user: user._id, companions } } },
    );

    // Send notifications to user
    await Notification.Rsvp.record(eventId, user._id, companions);
    // Send notification to team
    await Notification["Rsvp.Team"].record(eventId, user._id, companions);

    // if you cant load course its probably because the event doesnt have one
    const course = await Courses.findOneAsync(event.courseId);
    if (!course) {
      return;
    }

    const change = new Subscribe(course, user._id, "participant", "rsvp");
    if (change.validFor(user)) {
      await processChange(change, { isSimulation: this.isSimulation });
    }

    await Meteor.callAsync("course.updateNextEvent", event.courseId);
  },
  { simulation: false },
);

export const removeParticipant = ServerMethod(
  "event.removeParticipant",
  async (eventId: string) => {
    check(eventId, SafeString());

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "please log in");
    }

    const event = await Events.findOneAsync(eventId);
    // ignore broken eventIds
    if (!event) {
      return;
    }
    // dont allow participant-mutations if event has passed
    if (moment().isAfter(event.end)) {
      throw new Meteor.Error(401, "cannot unregister, event has already passed");
    }

    await Events.updateAsync({ _id: eventId }, { $pull: { participants: { user: userId } } });

    await Meteor.callAsync("course.updateNextEvent", event.courseId);
  },
  { simulation: false },
);

export const ContactParticipantsOptionsPattern = {
  revealAddress: Boolean,
  sendCopy: Boolean,
};
export type ContactParticipantsOptions = Type<typeof ContactParticipantsOptionsPattern>;

export const contactParticipants = ServerMethod(
  "event.contactParticipants",
  async (eventId: string, message: string, options: ContactParticipantsOptions) => {
    check(eventId, SafeString());
    check(message, SafeString());
    check(options, ContactParticipantsOptionsPattern);

    const operator = await Meteor.userAsync();
    if (!operator) {
      throw new Meteor.Error(401, "please log in");
    }
    const event = Events.findOne(eventId);
    if (!event) {
      throw new Meteor.Error(404, "event not found");
    }
    if (
      !event.editableBy(operator) &&
      !operator.groups.some((g) => event.groupOrganizers.includes(g)) &&
      !operator.privileged("admin")
    ) {
      throw new Meteor.Error(401, "not permitted");
    }

    await Notification["Event.ContactParticipants"].record(
      operator._id,
      message,
      eventId,
      options.revealAddress,
      options.sendCopy,
    );
  },
);

export const cancel = ServerMethod(
  "event.cancel",
  async (eventId: string, comment?: string | null) => {
    check(eventId, SafeString());
    check(comment, Match.Maybe(SafeString()));

    const operator = await Meteor.userAsync();
    if (!operator) {
      throw new Meteor.Error(401, "please log in");
    }
    const event = await Events.findOneAsync({ _id: eventId });
    if (!event) {
      throw new Meteor.Error(404, "no such event");
    }
    if (
      !event.editableBy(operator) &&
      !operator.groups.some((g) => event.groupOrganizers.includes(g)) &&
      !operator.privileged("admin")
    ) {
      throw new Meteor.Error(401, "edit not permitted");
    }

    await Events.updateAsync(event._id, { $set: { canceled: true } });

    if (event.participants?.length) {
      if (comment) {
        // eslint-disable-next-line no-param-reassign
        comment = comment.trim().substring(0, 2000).trim();
      }

      await Notification["Event.Canceled"].record(operator._id, eventId, comment || "");
    }
  },
);

export const uncancel = ServerMethod("event.uncancel", async (eventId: string) => {
  check(eventId, SafeString());

  const event = await Events.findOneAsync({ _id: eventId });
  if (!event) {
    throw new Meteor.Error(404, "no such event");
  }
  const user = await Meteor.userAsync();
  if (!user || !event.editableBy(user)) {
    throw new Meteor.Error(401, "edit not permitted");
  }
  await Events.updateAsync(event._id, { $set: { canceled: false } });
});
