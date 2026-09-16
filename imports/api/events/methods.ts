import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { assignIn } from "lodash-es";
import moment from "moment";
import { Random } from "meteor/random";

import { Groups } from "../groups/groups";
import { Subscribe, processChange } from "../groups/subscription";
import * as groupHistoryDenormalizer from "../groups/historyDenormalizer";
import * as groupTimeLastEditDenormalizer from "../groups/timeLastEditDenormalizer";
import * as groupImageDenormalizer from "./groupImageDenormalizer";
import * as categoriesDenormalizer from "/imports/api/events/categoriesDenormalizer";
import * as organizationsAndEditorsDenormalizer from "./organizationsAndEditorsDenormalizer";
import * as venueDenormalizer from "/imports/api/events/venueDenormalizer";
import * as groupNextEventDenormalizer from "../groups/nextEventDenormalizer";
import * as regionsCountDenormalizer from "/imports/api/regions/countDenormalizer";
import { EventEntity, EventModel, Events, OEvent } from "/imports/api/events/events";
import { isEventVenueRef } from "./lib/isEventVenueRef";
import { Organizations } from "../organizations/organizations";
import { Regions } from "/imports/api/regions/regions";
import { loadRoles } from "/imports/api/regions/loadRoles";

import { Notification } from "../../startup/both/emails/notification";
import { AffectedReplicaSelectors } from "/imports/utils/affected-replica-selectors";
import * as HtmlTools from "/imports/utils/html-tools";
import { LocalTime } from "/imports/utils/local-time";
import * as StringTools from "/imports/utils/string-tools";
import * as UpdateMethods from "/imports/utils/update-methods";
import { ServerMethod } from "/imports/utils/ServerMethod";
import { HtmlString, Type } from "/imports/utils/CustomChecks";
import { OrganizationPromoters } from "/imports/utils/update-methods";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { Venues } from "../venues/venues";
import { UserModel } from "../users/users";
import { GeodataPattern } from "/imports/api/Geodata";

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
  const affected: string[] = [];

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

        const regionZone = await LocalTime.zoneAsync(replica.region);
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

        await Events.updateAsync({ _id: replica._id }, { $set: replicaChanges });
      }

      affected.push(replica._id);
    }
  };

  return {
    affected() {
      return affected;
    },
    apply,
  };
};

export const EventVenuePattern = {
  _id: Match.Optional(String),
  name: Match.Optional(String),
  loc: Match.Optional(GeodataPattern),
  level: Match.Optional(Match.Integer),
  address: Match.Optional(String),
  editor: Match.Optional(String),
  restrictedUse: Match.Optional(Boolean),
};

export const UpdateFieldsPattern = {
  title: String,
  description: HtmlString(),
  venue: Match.Optional(EventVenuePattern),
  room: Match.Optional(String),
  startLocal: Match.Optional(String),
  endLocal: Match.Optional(String),
  internal: Match.Optional(Boolean),
  sendReminder: Match.Optional(Boolean),
  noRsvp: Match.Optional(Boolean),
  maxParticipants: Match.Optional(Match.Integer),
};
export type UpdateFields = Type<typeof UpdateFieldsPattern>;

export const CreateFieldsPattern = {
  ...UpdateFieldsPattern,
  venue: EventVenuePattern,
  groupId: Match.Optional(String),
  region: String,
  replicaOf: Match.Optional(String),
  organizations: Match.Optional([String]),
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
    check(eventId, String);

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
      if (editFields.groupId) {
        const group = await Groups.findOneAsync(editFields.groupId);
        if (!group) {
          throw new Meteor.Error(404, "group not found");
        }
        if (!group.editableBy(user)) {
          throw new Meteor.Error(401, "not permitted");
        }
      }

      if (editFields.replicaOf) {
        const parent = await Events.findOneAsync(editFields.replicaOf);
        if (!parent) {
          throw new Meteor.Error(404, "replica parent not found");
        }
        if (parent.groupId !== editFields.groupId) {
          throw new Meteor.Error(400, "replica must be in same group");
        }
      }

      if (!editFields.startLocal) {
        throw new Meteor.Error(400, "Event start date not provided");
      }

      const testedOrganizations = await Promise.all(
        editFields.organizations?.map(async (organizationId) => {
          const organization = await Organizations.findOneAsync(organizationId);
          if (!organization) {
            throw new Meteor.Error(404, `no organization with id ${organizationId}`);
          }
          return organization._id;
        }) || [],
      );
      editFields.organizations = testedOrganizations;

      // Validate end dates
      if (!editFields.endLocal) {
        throw new Meteor.Error(400, "Event end date not provided");
      }
      if (editFields.endLocal < editFields.startLocal) {
        throw new Meteor.Error(400, "Event end date before start date");
      }

      editFields.internal = !!editFields.internal;
      editFields.sendReminder = PublicSettings.feature.sendReminderIsEditable
        ? !!editFields.sendReminder
        : PublicSettings.sendReminderPreset;

      // Synthesize event document because the code below relies on it
      event = assignIn(new OEvent(), {
        region: editFields.region,
        groupId: editFields.groupId,
        editors: [user._id],
      }) as EventModel;
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

    const regionZone = await LocalTime.zoneAsync(region._id);

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

    const venueId =
      (isEventVenueRef(editFields.venue) && editFields.venue?._id) ||
      (isEventVenueRef(event.venue) && event.venue._id);
    if (venueId) {
      const venue = await Venues.findOneAsync(venueId);

      if (venue && !venue.allowParallelEvents) {
        const hasParallelEvents = (
          await Events.findFilter(
            {
              venue: venue._id,
              period: [editFields.start || event.start, editFields.end || event.end],
            },
            /* take two to check for parallel events, maybe one is the current event */
            2,
          ).fetchAsync()
        ).some((e) => e._id !== event._id);

        if (hasParallelEvents) {
          throw new Meteor.Error(400, `This venue not allows to have two parallel events.`);
        }
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
    if (isEventVenueRef(editFields.venue))
      if (!isEventVenueRef(event.venue) || editFields.venue._id !== event.venue._id) {
        const venue = await Venues.findOneAsync(editFields.venue._id);
        if (venue?.restrictedUse && !venue.editableBy(user))
          throw new Meteor.Error(
            400,
            `this venue can only be chosen by its hosts to publish an event.`,
          );
      }

    if (Meteor.isServer) {
      const sanitizedDescription = StringTools.sanitizeMultiline(editFields.description);
      editFields.description = HtmlTools.sanitizeHtml(sanitizedDescription);
    }

    if (editFields.title) {
      editFields.title = StringTools.sanitizeSingleline(editFields.title, 1000);
      editFields.slug = StringTools.slug(editFields.title);
    }

    let affectedReplicas: string[] = [];
    if (isNew) {
      editFields.createdBy = user._id;
      editFields.teamOrganizations = [];
      let enrichedEvent = await groupImageDenormalizer.beforeInsert(editFields as any);
      if (enrichedEvent.groupId) {
        enrichedEvent = await categoriesDenormalizer.beforeInsert(enrichedEvent);
      }

      eventId = await Events.insertAsync(enrichedEvent);

      if (editFields.groupId) {
        await groupTimeLastEditDenormalizer.afterEventInsert(editFields.groupId);
        await groupHistoryDenormalizer.afterEventInsert(editFields.groupId, user._id, {
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
        affectedReplicas = replicaSync.affected();
      }

      if (event.groupId) {
        await groupHistoryDenormalizer.afterEventUpdate(event.groupId, user._id, {
          _id: eventId,
          title: editFields.title as string,
          slug: editFields.slug as string,
          startLocal: editFields.startLocal as string,
          replicasUpdated: !!(updateReplicasInfos || updateReplicasTime),
        });
      }
    }

    if (sendNotifications) {
      if (comment) {
        comment = comment.trim().substring(0, 2000).trim();
      }

      await Notification.Event.record(eventId, isNew, affectedReplicas, comment || undefined);
    }

    await venueDenormalizer.updateVenue(eventId);
    await organizationsAndEditorsDenormalizer.updateOrganizationsAndEditors(eventId);
    await regionsCountDenormalizer.updateCounters(event.region);
    // the assumption is that all replicas have the same group if any
    if (event.groupId) {
      await groupNextEventDenormalizer.updateNextEvent(event.groupId);
    }

    return eventId;
  },
  { simulation: false },
);

async function checkEditAllowed(eventId: string) {
  const operator = await Meteor.userAsync();
  if (!operator) {
    throw new Meteor.Error(401, "please log in");
  }

  const event = await Events.findOneAsync(eventId);
  if (!event) {
    throw new Meteor.Error(404, "event not found");
  }

  if (!event.editableBy(operator)) {
    throw new Meteor.Error(401, "not permitted");
  }
  return { event, operator };
}

export const remove = ServerMethod(
  "event.remove",
  async (eventId: string) => {
    check(eventId, String);

    const { event, operator } = await checkEditAllowed(eventId);

    await Events.removeAsync(eventId);

    // unlink child replicas
    await Events.updateAsync(
      { replicaOf: event._id },
      { $unset: { replicaOf: true } },
      { multi: true },
    );

    if (event.groupId) {
      await groupHistoryDenormalizer.afterEventRemove(event.groupId, operator._id, {
        title: event.title,
        startLocal: event.startLocal,
      });
      await groupNextEventDenormalizer.updateNextEvent(event.groupId);
    }
    await regionsCountDenormalizer.updateCounters(event.region);
  },
  { simulation: false },
);

/**
 * Add or remove a organization from the organization list
 *
 * @param eventId The event to update
 * @param organizationId The organization to add or remove
 * @param add Whether to add or remove the organization
 *
 */
export const promote = ServerMethod(
  "event.promote",
  async (eventId: string, organizationId: string, enable: boolean) => {
    await UpdateMethods.promote(Events as unknown as OrganizationPromoters)(
      eventId,
      organizationId,
      enable,
    );
    await organizationsAndEditorsDenormalizer.updateOrganizationsAndEditors(eventId);
  },
  { simulation: false },
);

/**
 * Add or remove a organization from the teamOrganizations list
 *
 * @param eventId The event to update
 * @param organizationId The organization to add or remove
 * @param add Whether to add or remove the organization
 *
 */
export const editing = ServerMethod(
  "event.editing",
  async (eventId: string, organizationId: string, enable: boolean) => {
    await UpdateMethods.editing(Events as unknown as OrganizationPromoters)(
      eventId,
      organizationId,
      enable,
    );
    await organizationsAndEditorsDenormalizer.updateOrganizationsAndEditors(eventId);
  },
  { simulation: false },
);

/**
 * Add current user as event-participant
 *
 * the user is also signed up for the group.
 */
export const addParticipant = ServerMethod(
  "event.addParticipant",
  /**
   * @param eventId The event to register for
   */
  async function (eventId: string, companions: number) {
    check(eventId, String);
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

    // Don't allow participant-mutations if event has passed
    if (Date.now() > event.end.getTime()) {
      throw new Meteor.Error(401, "cannot register, event has already passed");
    }

    const updated = await Events.updateAsync(
      {
        _id: eventId,
        "participants.user": { $ne: user._id },
      },
      {
        $push: {
          participants: {
            user: user._id,
            companions,
            removeToken: Random.secret(),
          },
        },
      },
    );

    if (updated === 0) {
      throw new Meteor.Error("already-participating", "User is already a participant");
    }

    // Send notifications to user
    await Notification.Rsvp.record(eventId, user._id);
    // Send notification to team
    await Notification["Rsvp.Team"].record(eventId, user._id);

    if (!event.groupId) {
      return;
    }
    // if you cant load group its probably because the event doesn't have one
    const group = await Groups.findOneAsync(event.groupId);
    if (!group) {
      return;
    }

    const roles = await loadRoles(group.region);
    const change = new Subscribe(
      group,
      roles.map((r) => r.id),
      user._id,
      "participant",
      "rsvp",
    );
    if (change.validFor(user)) {
      await processChange(change, { isSimulation: this.isSimulation });
    }

    await groupNextEventDenormalizer.updateNextEvent(event.groupId);
  },
  { simulation: false },
);

/**
 * Remove participant from the event. This Method can be called by the participant itself (1),
 * by an editor of the event (2) or by a user with a valid token (3).
 */
export const removeParticipant = ServerMethod(
  "event.removeParticipant",
  async (eventId: string, participantId?: string, token?: string) => {
    check(eventId, String);
    check(participantId, Match.Optional(String));
    check(token, Match.Optional(String));

    const event = await Events.findOneAsync(eventId);
    // ignore broken eventIds
    if (!event) {
      return;
    }
    // Don't allow participant-mutations if event has passed
    if (Date.now() > event.end.getTime()) {
      throw new Meteor.Error(401, "cannot unregister, event has already passed");
    }

    if (token) {
      // (3) remove participant from event participants (if token is valid)
      if (!participantId) {
        throw new Meteor.Error(400, "participantId missed");
      }
      if (!event.participants?.find((p) => p.user === participantId && p.removeToken === token)) {
        throw new Meteor.Error(403, "not enough authorization.");
      }
    } else {
      let operator: UserModel | null = null;

      operator = await Meteor.userAsync();
      if (!operator) {
        throw new Meteor.Error(401, "please log in");
      }

      if (participantId) {
        // (2) remove other participant from event participants (if logged in and has
        // edit permissions: admin, teamOrganizationMembers, teamMembers)

        if (!event.editableBy(operator)) {
          throw new Meteor.Error(403, "not enough authorization.");
        }
      } else {
        // (1) remove self from event participants (if logged in)
        participantId = operator._id;
      }
    }

    await Events.updateAsync(
      { _id: eventId },
      { $pull: { participants: { user: participantId } } },
    );

    if (!event.groupId) {
      return;
    }
    await groupNextEventDenormalizer.updateNextEvent(event.groupId);
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
    check(eventId, String);
    check(message, String);
    check(options, ContactParticipantsOptionsPattern);

    const { operator } = await checkEditAllowed(eventId);

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
    check(eventId, String);
    check(comment, Match.Maybe(String));

    const { event, operator } = await checkEditAllowed(eventId);

    await Events.updateAsync(event._id, { $set: { canceled: true } });

    if (event.participants?.length) {
      if (comment) {
        comment = comment.trim().substring(0, 2000).trim();
      }

      await Notification["Event.Canceled"].record(operator._id, event._id, comment || "");
    }
  },
);

export const uncancel = ServerMethod("event.uncancel", async (eventId: string) => {
  check(eventId, String);

  await checkEditAllowed(eventId);

  await Events.updateAsync(eventId, { $set: { canceled: false } });
});
