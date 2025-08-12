// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { intersection, uniq } from "lodash";
import moment from "moment";
import { useSession, useUser } from "/imports/utils/react-meteor-data";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { LocalTime } from "/imports/utils/local-time";
import * as Analytics from "/imports/ui/lib/analytics";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel, EventVenueEntity, OEvent } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { SaveFields } from "/imports/api/events/methods";
import * as CoursesMethods from "/imports/api/courses/methods";
import { useFindFilter as useGroupsFindFilter } from "/imports/api/groups/publications";
import { useAll } from "/imports/api/regions/publications";

import { useTranslation } from "react-i18next";
import { RegionTag } from "../../regions/tag";
import { Richtext } from "../../richtext";
import { PricePolicy } from "../../price-policy";
import { EditVenue } from "../edit-venue";
import { EditCustomFields } from "../../edit-custom-fields";
import { useDetails as useCourseDetails } from "/imports/api/courses/publications";
import { ButtonCancel, ButtonSave } from "/imports/ui/components/buttons";
import { Notify } from "../Notify";
import { EditStartEnd } from "./EditStartEnd";
import { UpdateAffectedReplica } from "./UpdateAffectedReplica";

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
    if (Router.current().params.query.group) {
      groups.push(Router.current().params.query.group as string);
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
    descriptionError: false,
    descriptionNumberOfCharacters: 0,
    startLocal: event.startLocal,
    endLocal: event.endLocal,
    internal: event.internal,
    sendReminder: event.sendReminder,
    room: event.room,
    maxParticipants: event.maxParticipants,
  });

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
      value: selectedVenue,
      onChange: (newValue: EventVenueEntity | undefined) => {
        setSelectedVenue(newValue);
      },
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
    const start = LocalTime.fromString(changes.startLocal);
    if (!start.isValid()) {
      const exampleDate = moment().format("L");
      Alert.error(
        t("event.edit.dateFormatWarning", "The date format must be of the {EXAMPLEDATE} format.", {
          EXAMPLEDATE: exampleDate,
        }),
      );
      return;
    }

    const title = changes.title;
    if (!title || title.length === 0) {
      Alert.error(t("event.edit.plzProvideTitle", "Please provide a title"));
      return;
    }

    if (!changes.description) {
      Alert.error(t("event.edit.plzProvideDescr", "Please provide a description"));
      return;
    }

    if (PublicSettings.eventDescriptionMax) {
      if (changes.descriptionError) {
        Alert.error(
          t("_inputField.maxlength", {
            MAXNUMBER: PublicSettings.eventDescriptionMax,
            NUMBER: changes.descriptionNumberOfCharacters - PublicSettings.eventDescriptionMax,
          }),
        );
        return;
      }
    }

    // on event creation or venue change for venues with restricted use can only selected by the host
    if (
      selectedVenue?._id &&
      selectedVenue.restrictedUse &&
      selectedVenue._id !== event._id &&
      !user?.venues?.includes(selectedVenue._id)
    ) {
      Alert.error(
        t(
          "event.edit.venueRestricedUse",
          "Please use a other venue than {VENUE} or ask its hosts to create your event.",
          { VENUE: selectedVenue.name },
        ),
      );
      return;
    }

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
    const isNew = eventId === "";
    if (isNew) {
      if (start.isBefore(LocalTime.now())) {
        Alert.error(
          t(
            "event.edit.startInPast",
            "The event starts in the past. Have you selected a start date and time?",
          ),
        );
        return;
      }

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
        if (!editevent.region || editevent.region === "all") {
          Alert.error(t("event.edit.plzSelectRegion", "Please select the region for this event"));
          return;
        }

        // We have this 'secret' feature where you can set a group ID
        // in the URL to assign a group to the event on creation
        const gs = [];
        if (Router.current().params.query.group) {
          gs.push(Router.current().params.query.group as string);
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
        Router.go("showEvent", { _id: eventId });
        Alert.success(
          t("message.eventCreated", 'The event "{TITLE}" has been created!', {
            TITLE: editevent.title,
          }),
        );

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
              24 /* Umrechnung in Tage */,
          ),
        );
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
    } catch (err) {
      Alert.serverError(err, t("eventEdit.replicatesUpdated.error", "Saving the event went wrong"));
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
          {!isNew && !event.courseId && <RegionTag region={event.region} />}

          <div className="mb-3">
            <label className="form-label">{t("course.event.edit.title", "Event title")}</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder={t("event.title.placeholder", "Write a catchy title here")}
              size={30}
              value={changes.title}
              onChange={(ev) => {
                setChanges({ ...changes, title: ev.currentTarget.value });
              }}
            />
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
          />
        </div>
        <div className="edit-page-body event-edit">
          <div className="mb-3">
            <label className="form-label">{t("course.event.edit.desc", "Description")}</label>
            <Richtext
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
                  descriptionError:
                    !!PublicSettings.eventDescriptionMax &&
                    numberOfCharacters > PublicSettings.eventDescriptionMax,
                  descriptionNumberOfCharacters: numberOfCharacters,
                });
              }}
            />
          </div>
          {!(!isNew && event.isPrivate()) && <PricePolicy dismissable wrap="mb-3" />}

          {showRegionSelection() && (
            <div className="mb-3">
              <label className="form-label">{t("course.edit.region", "Region")}</label>
              <div className="input-group">
                <div className="input-group-text">
                  <span className="fa-solid fa-location-dot" aria-hidden="true"></span>
                </div>
                <select
                  className="form-select"
                  name="region"
                  onChange={(ev) => {
                    setSelectedRegion(ev.currentTarget.value);
                  }}
                >
                  <option
                    className="select-placeholder"
                    disabled
                    selected={currentRegion === "all"}
                    value=""
                  >
                    {t("_selection.pleaseSelect")}
                  </option>
                  {regions.map((r) => (
                    <option key={r._id} selected={currentRegion === r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
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

// for Blaze

import "./template.html";

Template.registerHelper("EventEdit", () => Edit);
