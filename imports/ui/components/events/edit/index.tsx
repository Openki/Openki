// NOTE All dates are in local time unless otherwise noted. Moment doesn't have
// a "timezone-unaware" mode. Thus Momentjs is kept in the belief that the dates
// are all UTC even though we mean local time. The reason for this is that
// the timezone might actually change when a different region is selected. We
// wouldn't want the time or even date field to change because of this switch.

import { intersection } from "lodash-es";
import { Router } from "meteor/iron:router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { LocalTime } from "/imports/utils/local-time";
import { MeteorAsync } from "/imports/utils/promisify";
import { useUser } from "/imports/utils/react-meteor-data";
import { useSearchParams } from "/imports/utils/react-meteor-router";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";
import { useAccountTasks } from "/imports/utils/useAccountTasks";

import * as Alert from "/imports/api/alerts/alert";
import * as CoursesMethods from "/imports/api/courses/methods";
import { EventModel, OEvent } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { SaveFields } from "/imports/api/events/methods";
import { useFindFilter as useOrganizationsFindFilter } from "/imports/api/organizations/publications";
import { useDetails as useCourseDetails } from "/imports/api/courses/publications";
import { useAll as useRegions } from "/imports/api/regions/publications";
import { useDetails as useVenueDetails } from "/imports/api/venues/publications";
import { CourseCustomField } from "/imports/api/courses/courses";

import { ButtonCancel, ButtonSave } from "../../Buttons";
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

import { useFindParallelEvents } from "./useFindParallelEvents";
import { useFindExternalParallelEvents } from "/imports/ui/components/events/edit/useFindExternalParallelEvents";

import "./styles.scss";

function EditCourseCustomFields({
  courseId,
  values,
  onChange,
}: {
  courseId: string;
  values: CourseCustomField[] | undefined;
  onChange: (values: CourseCustomField[]) => void;
}) {
  const [isCourseLoading, course] = useCourseDetails(courseId);
  const [organizationsIsLoading, organizations] = useOrganizationsFindFilter(
    { when: !!course?.teamOrganizations },
    { ids: course?.teamOrganizations },
  );

  if (isCourseLoading() || organizationsIsLoading()) {
    return null;
  }

  const customFields = organizations?.flatMap((o) => o.customCourseFields || []);

  return (
    <>
      {!!customFields?.length && (
        <div className="mb-3">
          <EditCustomFields fields={customFields} values={values} onChange={onChange} />
        </div>
      )}
    </>
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

  const user = useUser();

  const currentRegion = useCurrentRegionId();
  const [isRegionsLoading, regions] = useRegions();
  const [isCourseLoading, course] = useCourseDetails({ when: !!event.courseId }, event.courseId);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(event.region);
  // init selected region
  useEffect(() => {
    if (!isNew) {
      // only needed for new events
      return;
    }

    if (event.courseId) {
      if (!course) {
        // wait until course is loaded
        return;
      }
      // The region is the same as in course
      setSelectedRegion(course.region);
    } else if (currentRegion) {
      //  If the session sets the region, we use it.
      setSelectedRegion(currentRegion);
    } else if (regions.length === 1) {
      // There is only one region
      setSelectedRegion(regions[0]._id);
    }
  }, [course, currentRegion, regions]);

  const [selectedVenue, setSelectedVenue] = useState(event.venue);
  const [noRsvpChecked, setNoRsvpChecked] = useState(!!event.noRsvp);

  const [isBusy, setIsBusy] = useState(false);
  const { promptToLogin } = useAccountTasks();

  const [customFieldValues, setCustomFieldValues] = useState<CourseCustomField[] | undefined>(
    undefined,
  );
  // init custom field values
  useEffect(() => {
    if (event.courseId) {
      if (!course) {
        // wait until course is loaded
        return;
      }
      setCustomFieldValues(course.customFields);
    }
  }, [course]);

  const [venueIsLoading, venue] = useVenueDetails({ when: !!selectedVenue }, selectedVenue?._id);

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
    description: event.description || "",
    descriptionNumberOfCharacters: 0,
    startLocal: event.startLocal,
    endLocal: event.endLocal,
    internal: event.internal,
    sendReminder: event.sendReminder,
    room: event.room || "",
    maxParticipants: event.maxParticipants,
  });
  const parallelEvents = useFindParallelEvents(selectedRegion, selectedVenue?._id, {
    _id: event._id,
    ...changes,
  });
  const externalParallelEvents = useFindExternalParallelEvents(selectedRegion, selectedVenue?._id, {
    _id: event._id,
    ...changes,
  });

  const allParallelEvents = [
    ...parallelEvents.map((e) => ({ ...e, url: Router.path("showEvent", e) })),
    ...externalParallelEvents.map((e) => ({
      _id: e.id,
      title: e.summary,
      room: e.location,
      startLocal: e.start,
      endLocal: e.end,
      url: e.url,
    })),
  ];

  const [errors, checkValidity, addError] = useValidation(
    {
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
            NUMBER:
              changes.descriptionNumberOfCharacters - (PublicSettings.eventDescriptionMax || 0),
          }),
      },
      noRegion: {
        field: "region",
        onCheckValidity: () => !!selectedRegion,
        text: () => t("event.edit.plzSelectRegion", "Please select the region for this event"),
      },
      parallelEvents: {
        field: "startEndVenue",
        onCheckValidity: () =>
          venueIsLoading() || !venue || venue.allowParallelEvents || allParallelEvents.length === 0,
        text: () => (
          <>
            {t(
              "event.edit.venue.parallelEvents.disallowed",
              "Parallel events in this venue are not allowed.",
            )}{" "}
            <OtherEventsMessage events={allParallelEvents} />{" "}
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
    },
    { autoCheckFixed: true },
  );

  useEffect(() => {
    // only auto check for description to long
    if (changes.descriptionNumberOfCharacters > 0) {
      checkValidity("description");
    }
  }, [changes.description]);

  useEffect(() => {
    // loads some resources, so calling checkValidity onChange make unexpected things
    checkValidity("startEndVenue");
    // only run when values that get checked are changed
  }, [venue, allParallelEvents]);

  function showRegionSelection() {
    return (
      // You can select the region for events that are new
      isNew &&
      // and not associated with a course
      !event.courseId &&
      // and the session not sets the region
      !currentRegion &&
      // and when more then one region exists
      regions.length > 1
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
        courseId: event.courseId,
        room: changes.room,
        startLocal: changes.startLocal,
        endLocal: changes.endLocal,
      },
      value: selectedVenue,
      onChange: (newValue) => setSelectedVenue(newValue),
      errors,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

    if (isNew) {
      editevent.region = selectedRegion as string;
      if (event.courseId) {
        editevent.courseId = event.courseId;
      } else {
        // We have this 'secret' feature where you can set a organization ID
        // in the URL to assign a organization to the event on creation
        if (searchParams.organization) {
          editevent.organizations = [searchParams.organization];
        }
      }
    }

    const newUpdateReplicasTime = !startDayChanged && timeChanged && updateReplicas.time;

    const sendNotifications = notifyChecked;

    setIsBusy(true);
    try {
      const user = await promptToLogin();
      if (!user) {
        return;
      }

      const eventId = await EventsMethods.save(
        event._id || "",
        editevent,
        updateReplicas.infos,
        newUpdateReplicasTime,
        newUpdateReplicasTime && updateReplicas.timeOfChangedReplicas,
        sendNotifications,
        addNotificationMessage,
      );

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
        // unknown error
        Alert.serverError(
          err,
          t("eventEdit.replicatesUpdated.error", "Saving the event went wrong"),
        );
      }
    } finally {
      setIsBusy(false);
    }
  }

  if (isRegionsLoading() || isCourseLoading()) {
    return null;
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
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
              onChange={(value) => setChanges((changes) => ({ ...changes, title: value }))}
              onBlur={() => checkValidity("title")}
              error={errors.title}
            />
          </div>
          <EditStartEnd
            {...changes}
            onChange={(newValue) => {
              setChanges((changes) => ({ ...changes, ...newValue }));
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
              value={changes.description}
              onChange={(newValue, numberOfCharacters) =>
                setChanges((changes) => ({
                  ...changes,
                  description: newValue,
                  descriptionNumberOfCharacters: numberOfCharacters,
                }))
              }
              onBlur={() => checkValidity("description")}
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
                onBlur={() => checkValidity("region")}
                error={errors.region}
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
                    value={changes.room}
                    onChange={(value) => setChanges((changes) => ({ ...changes, room: value }))}
                  />
                </div>
              )}
            </>
          )}

          {!!event.courseId && (
            <EditCourseCustomFields
              courseId={event.courseId}
              values={customFieldValues}
              onChange={(values) => setCustomFieldValues(values)}
            />
          )}
          <div className="mb-3">
            <FormCheck
              id="event-edit-no-rsvp"
              type="box"
              label={t("event.edit.noRsvp", "No reservation required")}
              checked={noRsvpChecked}
              onChange={(checked) => setNoRsvpChecked(checked)}
            />

            <div className="form-switch-text-indent">
              {noRsvpChecked ? (
                <div className="form-text">
                  {t(
                    "event.edit.noRsvp.description",
                    "Registration for this event is disabled. You might want to explain why in the description.",
                  )}
                </div>
              ) : (
                <FormControl
                  id="event-edit-max-participants"
                  type="integer"
                  label={t("course.event.edit.maxParticipants", "maximal number of participants")}
                  optional
                  prepend="fa-solid fa-users fa-fw"
                  min={0}
                  step={1}
                  value={changes.maxParticipants || 0}
                  onChange={(value) =>
                    setChanges((changes) => ({ ...changes, maxParticipants: value }))
                  }
                />
              )}
            </div>
          </div>

          <div className="mb-3">
            <FormCheck
              id="event-edit-internal"
              type="box"
              label={t("event.edit.internal", "Hide on front page")}
              additionalInformation={t(
                "event.edit.internal.description",
                "Show it only on organization and venue pages",
              )}
              checked={changes.internal}
              onChange={(checked) => setChanges((changes) => ({ ...changes, internal: checked }))}
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
                type="box"
                label={t(
                  "event.edit.sendReminder",
                  "Send a reminder e-mail to all participants 24 hours before the event starts.",
                )}
                checked={changes.sendReminder}
                onChange={(checked) =>
                  setChanges((changes) => ({ ...changes, sendReminder: checked }))
                }
              />
            </div>
          )}

          <div className="form-actions">
            <ButtonSave submit id="events-edit-save" isBusy={isBusy} />
            <ButtonCancel id="events-edit-cancel" onClick={onCancel} disabled={isBusy} />
          </div>
        </div>
      </div>
    </form>
  );
}
