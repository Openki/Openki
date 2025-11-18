// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import { uniq, intersection } from "lodash-es";
import { Router } from "meteor/iron:router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { LocalTime } from "/imports/utils/local-time";
import { MeteorAsync } from "/imports/utils/promisify";
import { useSession, useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";

import * as Alert from "/imports/api/alerts/alert";
import * as CoursesMethods from "/imports/api/courses/methods";
import { EventModel, OEvent } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { SaveFields } from "/imports/api/events/methods";
import { useFindFilter as useGroupsFindFilter } from "/imports/api/groups/publications";
import { useAll } from "/imports/api/regions/publications";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { CourseCustomField } from "/imports/api/courses/courses";

import { ButtonCancel, ButtonSave } from "../../Buttons.old";
import { EditCustomFields } from "../../EditCustomFields";
import { FormCheck } from "../../FormCheck";
import { RegionSelect } from "../../RegionSelect";
import { FormControl } from "../../form-control";
import { PricePolicy } from "../../price-policy";
import { Tag } from "../../regions/tag";
import { Notify } from "../Notify";
import { EditVenue, Props as EditVenueProps } from "../edit-venue";
import { EditStartEnd } from "./EditStartEnd";
import { OtherEventsMessage } from "./OtherEventsMessage";
import { UpdateAffectedReplica } from "./UpdateAffectedReplica";
import { useDetails as useCourseDetails } from "/imports/api/courses/publications";

import { useFindParallelEvents } from "./useFindParallelEvents";

import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import "./styles.scss";

interface NewEventModel {
  startLocal: string;
  endLocal: string;
  sendReminder: boolean;
}

export type EventEditData = EventModel | (NewEventModel & OEvent & Partial<EventModel>);

export type Props =
  | {
      event: EventModel;
      isNew: false;
      afterSave: () => void;
      onCancel: () => void;
    }
  | {
      event: NewEventModel & OEvent & Partial<EventModel>;
      isNew: true;
      afterSave: () => void;
      onCancel: () => void;
    };

export function Edit({ event, isNew, afterSave, onCancel }: Props) {
  const { t } = useTranslation();

  const searchParams = useSearchParams();

  const currentRegion = CleanedRegion(useSession("region"));
  const [isRegionsLoading, regions] = useAll();
  const user = useUser();

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(currentRegion);
  const [selectedVenue, setSelectedVenue] = useState(event.venue);
  const [noRsvpChecked, setNoRsvpChecked] = useState(!!event.noRsvp);

  const [isBusy, setIsBusy] = useState(false);

  const [isCourseLoading, course] = useCourseDetails(event.courseId || "-1");

  function initCustomFieldValues() {
    const courseId = event.courseId;
    if (courseId) {
      return course?.customFields;
    }
    return undefined;
  }

  const [customFieldValues, setCustomFieldValues] = useState<CourseCustomField[] | undefined>(
    undefined,
  );

  useEffect(() => {
    setCustomFieldValues(initCustomFieldValues());
  }, [course]);

  function getRegion() {
    if (!isNew) {
      // only needed for new events
      return undefined;
    }

    let regionId: string;
    if (event.courseId) {
      if (!course) {
        if (isCourseLoading()) {
          return undefined;
        }
        throw new Error("Unexpected undefined: course");
      }

      // The region is the same as in course
      regionId = course.region;
    } else if (regions.length === 1) {
      // There is only one region
      regionId = regions[0]._id;
    } else if (selectedRegion) {
      // The one selected by the user.
      regionId = selectedRegion;
    } else {
      return undefined;
    }

    return regions.find((r) => r._id === regionId);
  }

  function getGroups() {
    const { courseId } = event;
    const groups = [];

    // We have this 'secret' feature where you can set a group ID
    // in the URL to assign a group to the event on creation
    if (searchParams.group) {
      groups.push(searchParams.group);
    }

    const defaultTeamGroups = getRegion()?.defaultTeamGroups;
    if (defaultTeamGroups) {
      groups.push(...defaultTeamGroups);
    }

    if (courseId) {
      if (isCourseLoading()) {
        return groups;
      }

      if (!course) {
        throw new Error("Unexpected undefined: course");
      }

      groups.push(...course.groupOrganizers);
    }

    // remove double groups
    return uniq(groups);
  }

  const [groupsIsLoading, groups] = useGroupsFindFilter({ ids: getGroups() });
  const [venueIsLoading, venue] = useVenueDetails(selectedVenue?._id || "-1");

  const [updateReplicas, setUpdateReplicas] = useState({
    infos: false,
    time: false,
    timeOfChangedReplicas: false,
  });
  const [startDayChanged, setStartDayChanged] = useState(false);
  const [timeChanged, setTimeChanged] = useState(false);

  // Sending an event notification is only possible when the event is
  // attached to a course. Otherwise there is nobody to inform.
  const [notifyChecked, setNotifyChecked] = useState(!!event.courseId && isNew);
  const [addNotificationMessage, setAddNotificationMessage] = useState("");

  const [changes, setChanges] = useState({
    title: event.title,
    description: event.description,
    descriptionNumberOfCharacters: 0,
    startLocal: event.startLocal,
    endLocal: event.endLocal,
    internal: event.internal,
    sendReminder: event.sendReminder,
    room: event.room,
    maxParticipants: event.maxParticipants,
  });
  const parallelEvents = useFindParallelEvents(selectedVenue?._id, selectedRegion, {
    _id: event._id,
    ...changes,
  });

  const [errors, checkValidity, addError] = useValidation({
    noTitle: {
      field: "title",
      onCheckValidity: () => !!changes.title,
      text: () => t("event.edit.plzProvideTitle", "Please provide a title"),
    },
    startWrongFormat: {
      field: "start",
      onCheckValidity: () => {
        const start = LocalTime.fromString(changes.startLocal);
        return start.isValid();
      },
      text: () => {
        const exampleDate = moment().format("L");
        return t(
          "event.edit.dateFormatWarning",
          "The date format must be of the {EXAMPLEDATE} format.",
          {
            EXAMPLEDATE: exampleDate,
          },
        );
      },
    },
    startInPast: {
      field: "start",
      onCheckValidity: () => {
        if (isNew) {
          const start = LocalTime.fromString(changes.startLocal);
          if (!start.isValid()) {
            // checked with a other validation
            return true;
          }
          return start.isAfter(LocalTime.now());
        } else {
          return true;
        }
      },
      text: () =>
        t(
          "event.edit.startInPast",
          "The event starts in the past. Have you selected a start date and time?",
        ),
    },
    noDescription: {
      field: "description",
      onCheckValidity: () => !!changes.description,
      text: () => t("event.edit.plzProvideDescr", "Please provide a description"),
    },
    descriptionToLong: {
      field: "description",
      onCheckValidity: () =>
        !PublicSettings.eventDescriptionMax ||
        changes.descriptionNumberOfCharacters <= PublicSettings.eventDescriptionMax,
      text: () =>
        t("_inputField.maxlength", {
          MAXNUMBER: PublicSettings.eventDescriptionMax,
          NUMBER: changes.descriptionNumberOfCharacters - (PublicSettings.eventDescriptionMax || 0),
        }),
    },
    noRegion: {
      field: "region",
      onCheckValidity: () => !!selectedRegion && selectedRegion !== "all",
      text: () => t("event.edit.plzSelectRegion", "Please select the region for this event"),
    },
    parallelEvents: {
      field: "startEndVenue",
      onCheckValidity: () =>
        venueIsLoading() || !venue || venue.allowParallelEvents || parallelEvents.length === 0,
      text: () => (
        <>
          {t(
            "event.edit.venue.parallelEvents.disallowed",
            "Parallel events in this venue are not allowed.",
          )}{" "}
          <OtherEventsMessage events={parallelEvents} />{" "}
          {t("event.edit.venue.parallelEvents.pleaseChange", "Please change venue or time.")}
        </>
      ),
    },
    venueRestricedUse: {
      field: "venue",
      onCheckValidity: () => {
        return (
          !selectedVenue?._id ||
          !selectedVenue.restrictedUse ||
          // on event creation or venue change for venues with restricted use can only selected by the host
          (!isNew && selectedVenue._id === event.venue?._id) ||
          !!user?.venues?.includes(selectedVenue._id)
        );
      },
      text: () =>
        t(
          "event.edit.venueRestricedUse",
          "Please use a other venue than {VENUE} or ask its hosts to create your event.",
          { VENUE: selectedVenue?.name },
        ),
    },
  });

  useEffect(() => {
    // after every change, check errors are fixed
    Object.keys(errors).forEach((key) => {
      checkValidity(key as any);
    });
  });

  useEffect(() => {
    // loads some resources, so calling checkValidity onChange make unexpected things
    checkValidity("startEndVenue");
    // only run when values that get checked are changed
  }, [venue, parallelEvents]);

  function showRegionSelection() {
    return (
      // You can select the region for events that are new
      isNew &&
      // and not associated with a course
      !event.courseId
    );
  }
  function showVenueSelection() {
    return !!selectedRegion;
  }

  function venueEditAttr(): EditVenueProps {
    return {
      region: selectedRegion as string,
      event: {
        _id: event._id,
        room: changes.room,
        startLocal: changes.startLocal,
        endLocal: changes.endLocal,
      },
      value: selectedVenue,
      onChange: (newValue) => setSelectedVenue(newValue),
      errors,
    };
  }
  const customFields = () => {
    return groups.flatMap((g) => g.customCourseFields || []);
  };

  async function handleSubmit() {
    if (!checkValidity()) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(".is-invalid")?.focus();
      }, 0);
      return;
    }

    const title = changes.title;

    const noRsvp = noRsvpChecked;

    let maxParticipants;
    if (!noRsvp) {
      maxParticipants = changes.maxParticipants;
    } else {
      // if no rsvp is set there is none limit for maxParticipants;
      maxParticipants = 0;
    }

    const editevent = {
      title,
      description: changes.description,
      venue: selectedVenue || {},
      room: changes.room,
      startLocal: changes.startLocal,
      endLocal: changes.endLocal,
      internal: changes.internal,
      sendReminder: changes.sendReminder,
      noRsvp,
      maxParticipants,
    } as SaveFields;

    let eventId = event._id || "";
    if (isNew) {
      if (event.courseId) {
        if (!course) {
          if (isCourseLoading()) {
            return;
          }

          throw new Error("Unexpected undefined: course");
        }

        editevent.region = course.region;
        editevent.courseId = event.courseId;
      } else {
        editevent.region = selectedRegion as string;

        // We have this 'secret' feature where you can set a group ID
        // in the URL to assign a group to the event on creation
        const gs = [];
        if (searchParams.group) {
          gs.push(searchParams.group);
        }
        editevent.groups = gs;
      }
    }

    const newUpdateReplicasTime = !startDayChanged && timeChanged && updateReplicas.time;

    const sendNotifications = notifyChecked;

    setIsBusy(true);
    try {
      const result = await EventsMethods.save(
        eventId,
        editevent,
        updateReplicas.infos,
        newUpdateReplicasTime,
        newUpdateReplicasTime && updateReplicas.timeOfChangedReplicas,
        sendNotifications,
        addNotificationMessage,
      );
      if (!result) {
        throw new Error("Unexpected undefined: eventId");
      }
      eventId = result;

      if (isNew) {
        Alert.success(
          t("message.eventCreated", 'The event "{TITLE}" has been created!', {
            TITLE: editevent.title,
          }),
        );

        if (event.courseId) {
          if (!course) {
            throw new Error("Unexpected undefined: course");
          }
          if (!user) {
            throw new Error("Unexpected undefined: user");
          }
          let role;
          if (intersection(user.badges, course.editors).length > 0) {
            role = "team";
          } else if (user.privileged("admin")) {
            role = "admin";
          } else {
            role = "unknown";
          }
          Analytics.trackEvent(
            "Event creations",
            `Event creations as ${role}`,
            regions.find((r) => r._id === course.region)?.nameEn,
            Math.round(
              (new Date().getTime() - course.time_created.getTime()) /
                1000 /
                60 /
                60 /
                24 /* Converted into days */,
            ),
          );
        } else {
          Analytics.trackEvent("Event creations", `Event creations without course`);
        }
      } else {
        Alert.success(
          t("message.eventChangesSaved", 'Your changes to the event "{TITLE}" have been saved.', {
            TITLE: editevent.title,
          }),
        );
      }

      if (updateReplicas.infos || updateReplicas.time) {
        Alert.success(
          t("eventEdit.replicatesUpdated", 'Replicas of "{TITLE}" have also been updated.', {
            TITLE: editevent.title,
          }),
        );
      }

      if (event.courseId && customFieldValues) {
        await CoursesMethods.save(event.courseId, { customFields: customFieldValues });
      }

      afterSave();

      if (isNew) {
        await MeteorAsync.defer();
        Router.go("showEvent", { _id: eventId });
      }
    } catch (err) {
      if (!addError(err.reason)) {
        Alert.serverError(
          err,
          t("eventEdit.replicatesUpdated.error", "Saving the event went wrong"),
        );
      }
    } finally {
      setIsBusy(false);
    }
  }

  if (isRegionsLoading() || isCourseLoading() || groupsIsLoading()) {
    return null;
  }

  return (
    <form>
      <div className="edit-page">
        <h3>
          {isNew
            ? t("course.event.edit.add", "Create an event")
            : t("course.event.edit.edit", "Edit event")}
        </h3>
        {isNew && !event.courseId && (
          <>
            {t(
              "course.createEventInfo",
              "Use this form to publish a singular, one-off, already organized event. Otherwise create or propose a course here:",
            )}{" "}
            <a href={Router.path("proposeCourse")}>
              {t("menue.ProposeCourse", "Propose a course")}
            </a>
          </>
        )}

        <div className="edit-page-header event-edit">
          {!isNew && !event.courseId && <Tag region={event.region} />}

          <div className="mb-3">
            <FormControl
              id="event-edit-title"
              type="text"
              size="large"
              label={t("course.event.edit.title", "Event title")}
              placeholder={t("event.title.placeholder", "Write a catchy title here")}
              value={changes.title || ""}
              onChange={(value) => setChanges({ ...changes, title: value })}
              onBlur={() => checkValidity("title")}
              error={errors.title}
            />
          </div>
          <EditStartEnd
            {...changes}
            onChange={(newValue) => {
              setChanges({ ...changes, ...newValue });
              setStartDayChanged(!moment.utc(newValue.startLocal).isSame(event.startLocal, "day"));
              setTimeChanged(
                !(
                  moment.utc(newValue.startLocal).isSame(moment.utc(event.startLocal), "minute") &&
                  moment.utc(newValue.endLocal).isSame(moment.utc(event.endLocal), "minute")
                ),
              );
            }}
            /* Disabled for past */
            disabled={!!event.start && event.start < new Date()}
            errors={errors}
          />
        </div>

        <div className="edit-page-body event-edit">
          <div className="mb-3">
            <FormControl
              id="event-edit-description"
              type="richtext"
              label={t("course.event.edit.desc", "Description")}
              placeholder={t(
                "event.description.placeholder",
                "Describe your event as accurately as possible. This helps people know how to prepare and what to expect from this meeting (e.g. level, prerequisites, activities, teaching methods, what to bring, etc.)",
              )}
              value={changes.description || ""}
              onChange={(newValue, numberOfCharacters) => {
                setChanges({
                  ...changes,
                  description: newValue,
                  descriptionNumberOfCharacters: numberOfCharacters,
                });
                checkValidity("description");
              }}
              error={errors.description}
            />
          </div>

          {!(!isNew && event.isPrivate()) && <PricePolicy dismissable wrap="mb-3" />}

          {showRegionSelection() && (
            <div className="mb-3">
              <RegionSelect
                id="event-edit-region"
                value={selectedRegion}
                onChange={(value) => setSelectedRegion(value)}
              />
            </div>
          )}

          {showVenueSelection() && (
            <>
              <EditVenue {...venueEditAttr()} />
              {!!selectedVenue && (
                <div className="mb-3">
                  <FormControl
                    id="event-edit-room"
                    type="text"
                    label={t("course.event.edit.room", "Room")}
                    optional
                    prepend="fa-solid fa-signs-post fa-fw"
                    value={changes.room || ""}
                    onChange={(value) => {
                      setChanges({ ...changes, room: value });
                      checkValidity("venue");
                    }}
                  />
                </div>
              )}
            </>
          )}

          {!!customFields()?.length && (
            <div className="mb-3">
              <EditCustomFields
                fields={customFields()}
                values={customFieldValues}
                onChange={(values) => setCustomFieldValues(values)}
              />
            </div>
          )}
          <div className="mb-3">
            <FormCheck
              id="event-edit-no-rsvp"
              type="switch"
              label={t("event.edit.noRsvp", "No reservation required")}
              hint={
                noRsvpChecked
                  ? t(
                      "event.edit.noRsvp.description",
                      "Registration for this event is disabled. You might want to explain why in the description.",
                    )
                  : undefined
              }
              checked={noRsvpChecked}
              onChange={(checked) => setNoRsvpChecked(checked)}
            />

            {!noRsvpChecked && (
              <div className="form-switch-text-indent">
                <FormControl
                  id="event-edit-max-participants"
                  type="integer"
                  label={t("course.event.edit.maxParticipants", "maximal number of participants")}
                  optional
                  prepend="fa-solid fa-users fa-fw"
                  min={0}
                  step={1}
                  value={changes.maxParticipants || 0}
                  onChange={(value) => setChanges({ ...changes, maxParticipants: value })}
                />
              </div>
            )}
          </div>

          <div className="mb-3">
            <FormCheck
              id="event-edit-internal"
              type="switch"
              label={t("event.edit.internal", "Hide on front page")}
              hint={t("event.edit.internal.description", "Show it only on group and venue pages")}
              checked={changes.internal}
              onChange={(checked) => setChanges({ ...changes, internal: checked })}
            />
          </div>

          {!isNew && (
            <div className="mb-3">
              <UpdateAffectedReplica
                values={updateReplicas}
                event={event}
                startDayChanged={startDayChanged}
                timeChanged={timeChanged}
                onChange={(newValues) => setUpdateReplicas(newValues)}
              />
            </div>
          )}

          {!!event.courseId && (
            <div className="mb-3">
              <Notify
                event={event}
                isNew={isNew}
                checked={notifyChecked}
                message={addNotificationMessage}
                onToggle={(v) => setNotifyChecked(v)}
                onMessageChange={(v) => setAddNotificationMessage(v)}
              />
            </div>
          )}

          {!noRsvpChecked && PublicSettings.feature.sendReminderIsEditable && (
            <div className="mb-3">
              <FormCheck
                id="event-edit-send-reminder"
                type="switch"
                label={t(
                  "event.edit.sendReminder",
                  "Send a reminder e-mail to all participants 24 hours before the event starts.",
                )}
                checked={changes.sendReminder}
                onChange={(checked) => setChanges({ ...changes, sendReminder: checked })}
              />
            </div>
          )}

          <div className="form-actions">
            <ButtonSave id="events-edit-save" onClick={handleSubmit} disabled={isBusy} />
            <ButtonCancel id="events-edit-cancel" onClick={onCancel} disabled={isBusy} />
          </div>
        </div>
      </div>
    </form>
  );
}
