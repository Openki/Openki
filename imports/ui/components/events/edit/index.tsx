// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import React, { useEffect, useMemo, useState } from "react";
import { Router } from "meteor/iron:router";
import { intersection, uniq } from "lodash";
import moment from "moment";
import { useSession, useUser } from "/imports/utils/react-meteor-data";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { LocalTime, useLocalTimeZone } from "/imports/utils/local-time";
import * as Analytics from "/imports/ui/lib/analytics";
import { MeteorAsync } from "/imports/utils/promisify";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { useTranslation } from "react-i18next";
import { useValidation } from "/imports/ui/lib/useValidation";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel, EventVenueEntity, OEvent } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { SaveFields } from "/imports/api/events/methods";
import * as CoursesMethods from "/imports/api/courses/methods";
import { useFindFilter as useGroupsFindFilter } from "/imports/api/groups/publications";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { useAll } from "/imports/api/regions/publications";
import * as Events from "/imports/api/events/publications";

import { Tag } from "../../regions/tag";
import { Richtext } from "../../richtext";
import { PricePolicy } from "../../price-policy";
import { EditVenue } from "../edit-venue";
import { EditCustomFields } from "../../EditCustomFields";
import { useDetails as useCourseDetails } from "/imports/api/courses/publications";
import { ButtonCancel, ButtonSave } from "../../Buttons";
import { Notify } from "../Notify";
import { EditStartEnd } from "./EditStartEnd";
import { UpdateAffectedReplica } from "./UpdateAffectedReplica";
import { ReactJoin } from "/imports/utils/ReactJoin";
import { filterUserVenues } from "../edit-venue/search";

import "./styles.scss";

function useFindParallelEvents(
  venueId: string | undefined,
  regionId: string,
  event: {
    _id?: string | undefined;
    startLocal: string;
    endLocal: string;
  },
) {
  const regionZone = useLocalTimeZone(regionId);

  const start = regionZone.fromString(event.startLocal).toDate();
  const end = regionZone.fromString(event.endLocal).toDate();

  const [isLoading, events] = Events.useFindFilter({
    venue: venueId || "-1",
    period: [start, end],
  });

  // cache to prevent endless recalls
  return useMemo(() => {
    if (isLoading()) {
      return [];
    }

    /* ignore current event */
    return events.filter((e) => e._id !== event._id);
  }, [venueId, regionId, event._id, event.startLocal, event.endLocal, isLoading()]);
}

function OtherEventsMessage({ events }: { events: EventModel[] }) {
  const { t } = useTranslation();

  return ReactJoin(
    events.map((e) => (
      <React.Fragment key={e._id}>
        {e.room
          ? t(
              "event.edit.venue.parallelEvents.otherEventInRoom",
              `There is the event "{TITLE}" in room "{ROOM}".`,
              {
                TITLE: (
                  <a href={Router.path("showEvent", e)} target="_blank" rel="noreferrer">
                    {e.title}
                  </a>
                ),
                ROOM: e.room,
              },
            )
          : t("event.edit.venue.parallelEvents.otherEvent", `There is the event "{TITLE}".`, {
              TITLE: (
                <a href={Router.path("showEvent", e)} target="_blank" rel="noreferrer">
                  {e.title}
                </a>
              ),
            })}
      </React.Fragment>
    )),
    <> </>,
  );
}

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

  const currentRegion = useSession("region");
  const [isRegionsLoading, regions] = useAll();
  const user = useUser();

  let region = event.region;
  if (regions?.length === 1) {
    region = region || regions[0]?._id;
  }
  const [selectedRegion, setSelectedRegion] = useState<string>(region || currentRegion);
  const [selectedVenue, setSelectedVenue] = useState(event.venue);
  const [noRsvpChecked, setNoRsvpChecked] = useState(!!event.noRsvp);
  const [isBusy, setIsBusy] = useState(false);

  const [isCourseLoading, course] = useCourseDetails(event.courseId || "");

  function getRegion() {
    let result: string;
    if (event.courseId) {
      if (!course) {
        if (isCourseLoading()) {
          return undefined;
        }
        throw new Error("Unexpected undefined: course");
      }

      result = course.region;
    } else {
      if (!selectedRegion || selectedRegion === "all") {
        return undefined;
      }
      result = selectedRegion;
    }

    if (result) {
      // The region was preset for the frame
      return regions.find((r) => r._id === result);
    }
    if (regions.length === 1) {
      // There is only one region
      return regions[0];
    }
    return currentRegion;
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

  function customFieldValues() {
    const courseId = event.courseId;
    if (courseId) {
      return course?.customFields;
    }
    return undefined;
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
  const parallelEvents = useFindParallelEvents(selectedVenue?._id, selectedRegion, changes);

  const [warnings, checkForWarnings] = useValidation({
    restricedUse: {
      field: "venue",
      onCheckValidity: () =>
        venueIsLoading() ||
        !venue ||
        /* Not show hint if user is editor of venue */
        filterUserVenues(user, [venue]).length > 0 ||
        !!venue.restrictedUse,
      text: () => (
        <div className="alert alert-warning p-2">
          <span className="fa-solid fa-triangle-exclamation fa-fw" aria-hidden="true"></span>{" "}
          {t(
            "event.editVenue.restrictedUse",
            "This venue can only be chosen by its hosts to publish an event.",
          )}
        </div>
      ),
    },
    parallelEvents: {
      field: "startEndVenue",
      onCheckValidity: () =>
        venueIsLoading() || !venue || !venue.allowParallelEvents || parallelEvents.length === 0,
      text: function () {
        const inSameRoom = parallelEvents.find(
          (e) => e.room && changes.room && e.room.toUpperCase() === changes.room.toUpperCase(),
        );

        return (
          <div className="alert alert-warning p-2">
            <span className="fa-solid fa-triangle-exclamation fa-fw" aria-hidden="true"></span>{" "}
            {t("event.edit.venue.parallelEvents.allowed", "Event is overlapping.")}{" "}
            {inSameRoom && (
              <>
                {t(
                  "event.edit.venue.parallelEvents.sameRoom",
                  "Your event seem to be in same room as an other event.",
                )}{" "}
              </>
            )}
            <OtherEventsMessage events={parallelEvents} />
          </div>
        );
      },
    },
    contactHost: {
      field: "venue",
      onCheckValidity: () =>
        venueIsLoading() ||
        !venue ||
        /* Not show hint if user is editor of venue */
        filterUserVenues(user, [venue]).length > 0 ||
        !venue.restrictedUse,
      text: () => (
        <div className="alert alert-success p-2">
          {t(
            "event.editVenue.pleaseContactHost",
            "Make sure you have contacted the host of this venue for availability.",
          )}
        </div>
      ),
    },
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
          <OtherEventsMessage events={parallelEvents} />
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
    checkForWarnings("venue");
    checkForWarnings("startEndVenue");
    // only run when values that get checked are changed
  }, [venue, parallelEvents, changes]);

  function showRegionSelection() {
    // You can select the region for events that are new and not associated
    // with a course
    if (event._id || event.courseId) {
      return false;
    }
    return true;
  }
  function showVenueSelection() {
    return !!selectedRegion && selectedRegion !== "all";
  }

  function venueEditAttr() {
    return {
      region: selectedRegion,
      event: { _id: event._id, startLocal: changes.startLocal, endLocal: changes.endLocal },
      value: selectedVenue,
      onChange: (newValue: EventVenueEntity | undefined) => {
        setSelectedVenue(newValue);
      },
      errors,
      warnings,
    };
  }
  const customFields = (type?: "singleLine" | "multiLine") => {
    return (
      groups
        .flatMap((g) => g.customCourseFields || [])
        // when type is undefined all will get back
        .filter((g) => !type || (g.type || "singleLine") === type)
    );
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
        editevent.region = selectedRegion;

        // We have this 'secret' feature where you can set a group ID
        // in the URL to assign a group to the event on creation
        const gs = [];
        if (searchParams.group) {
          gs.push(searchParams.group);
        }
        editevent.groups = gs;
      }
    }

    const newCustomFields = customFields().map((i) => {
      return {
        name: i.name,
        displayText: i.displayText,
        value: $(`.js-custom-field-${i.name}`).val() as string,
        visibleFor: i.visibleFor,
      };
    });

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

      if (event.courseId) {
        await CoursesMethods.save(event.courseId, { customFields: newCustomFields });
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
            )}
            <a href={Router.path("proposeCourse")}>
              {t("menue.ProposeCourse", "Propose a course")}
            </a>
          </>
        )}

        <div className="edit-page-header event-edit">
          {!isNew && !event.courseId && <Tag region={event.region} />}

          <div className="mb-3">
            <label className="form-label">{t("course.event.edit.title", "Event title")}</label>
            <input
              type="text"
              className={`form-control form-control-lg ${errors.title ? "is-invalid" : ""}`}
              placeholder={t("event.title.placeholder", "Write a catchy title here")}
              value={changes.title}
              onChange={(ev) => {
                setChanges({ ...changes, title: ev.currentTarget.value });
              }}
              onBlur={() => {
                checkValidity("title");
              }}
            />
            {!!errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          {/* Disabled for past */}
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
            disabled={!!event.start && event.start < new Date()}
            errors={errors}
          />
        </div>
        <div className="edit-page-body event-edit">
          <div className="mb-3">
            <label className="form-label">{t("course.event.edit.desc", "Description")}</label>
            <Richtext
              className={errors.description ? "is-invalid" : ""}
              text={changes.description}
              placeholder={t(
                "event.description.placeholder",
                "Describe your event as accurately as possible. This helps people know how to prepare and what to expect from this meeting (e.g. level, prerequisites, activities, teaching methods, what to bring, etc.)",
              )}
              maxlength={PublicSettings.eventDescriptionMax}
              onChange={(newValue, numberOfCharacters) => {
                setChanges({
                  ...changes,
                  description: newValue,
                  descriptionNumberOfCharacters: numberOfCharacters,
                });
              }}
            />
            {!!errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
          {!(!isNew && event.isPrivate()) && <PricePolicy dismissable wrap="mb-3" />}

          {showRegionSelection() && (
            <div className="mb-3">
              <label className="form-label">{t("course.edit.region", "Region")}</label>
              <div className="input-group has-validation">
                <div className="input-group-text">
                  <span className="fa-solid fa-location-dot" aria-hidden="true"></span>
                </div>
                <select
                  className={`form-select ${errors.region ? "is-invalid" : ""}`}
                  name="region"
                  onChange={(ev) => {
                    setSelectedRegion(ev.currentTarget.value);
                  }}
                >
                  <option
                    className="select-placeholder"
                    disabled
                    selected={selectedRegion === "all"}
                    value=""
                  >
                    {t("_selection.pleaseSelect")}
                  </option>
                  {regions.map((r) => (
                    <option key={r._id} selected={selectedRegion === r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {!!errors.region && <div className="invalid-feedback">{errors.region}</div>}
              </div>
            </div>
          )}

          {showVenueSelection() && (
            <>
              <EditVenue {...venueEditAttr()} />
              {!!selectedVenue && (
                <div className="mb-3">
                  <label className="form-label">
                    {t("course.event.edit.room", "Room")}
                    <small> {t("_inputField.optional")}</small>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <span className="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={changes.room}
                      onChange={(ev) => {
                        setChanges({ ...changes, room: ev.currentTarget.value });
                        checkValidity("venue");
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {!!customFields()?.length && (
            <div className="mb-3">
              <EditCustomFields fields={customFields()} values={customFieldValues()} />
            </div>
          )}
          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="eventEditNoRsvpCheck"
                checked={noRsvpChecked}
                onChange={(ev) => {
                  setNoRsvpChecked(ev.currentTarget.checked);
                }}
              />
              <label className="form-check-label" htmlFor="eventEditNoRsvpCheck">
                {t("event.edit.noRsvp", "No reservation required")}
                {noRsvpChecked && (
                  <span className="form-text d-block">
                    {t(
                      "event.edit.noRsvp.description",
                      "Registration for this event is disabled. You might want to explain why in the description.",
                    )}
                  </span>
                )}
              </label>
            </div>
            {!noRsvpChecked && (
              <>
                <label className="form-label">
                  {t("course.event.edit.maxParticipants", "maximal number of participants")}
                  <small> {t("_inputField.optional")}</small>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <span className="fa-solid fa-users fa-fw" aria-hidden="true"></span>
                  </span>
                  {/* show empty input instead of 0 */}
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    step={1}
                    value={changes.maxParticipants || ""}
                    onChange={(ev) => {
                      const newValue = ev.currentTarget.valueAsNumber;
                      if (Number.isNaN(newValue)) {
                        return;
                      }
                      setChanges({
                        ...changes,
                        maxParticipants: Math.round(newValue),
                      });
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="eventEditInternalCheck"
                checked={changes.internal}
                onChange={(ev) => {
                  setChanges({ ...changes, internal: ev.currentTarget.checked });
                }}
              />
              <label className="form-check-label" htmlFor="eventEditInternalCheck">
                {t("event.edit.internal", "Hide on front page")}
                <span className="form-text d-block">
                  {t("event.edit.internal.description", "Show it only on group and venue pages")}
                </span>
              </label>
            </div>
            {!isNew && (
              <UpdateAffectedReplica
                values={updateReplicas}
                event={event}
                startDayChanged={startDayChanged}
                timeChanged={timeChanged}
                onChange={(newValues) => {
                  setUpdateReplicas(newValues);
                }}
              />
            )}

            <Notify
              event={event}
              isNew={isNew}
              checked={notifyChecked}
              message={addNotificationMessage}
              onToggle={(v) => setNotifyChecked(v)}
              onMessageChange={(v) => {
                setAddNotificationMessage(v);
              }}
            />
            {!noRsvpChecked && PublicSettings.feature.sendReminderIsEditable && (
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="eventEditSendReminderCheck"
                  checked={changes.sendReminder}
                  onChange={(ev) => {
                    setChanges({
                      ...changes,
                      sendReminder: ev.currentTarget.checked,
                    });
                  }}
                />
                <label className="form-check-label" htmlFor="eventEditSendReminderCheck">
                  {t(
                    "event.edit.sendReminder",
                    "Send a reminder e-mail to all participants 24 hours before the event starts.",
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="form-actions">
            <ButtonSave onClick={handleSubmit} disabled={isBusy} />
            <ButtonCancel
              onClick={() => {
                onCancel();
              }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
