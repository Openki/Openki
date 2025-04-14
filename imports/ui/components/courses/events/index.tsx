/* eslint-disable no-nested-ternary */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { Router } from "meteor/iron:router";

import * as Analytics from "/imports/ui/lib/analytics";

import * as EventsPub from "/imports/api/events/publications";
import { Regions } from "/imports/api/regions/regions";
import { CourseModel } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { useReactiveNow } from "/imports/utils/reactive-now";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Add } from "./add";
import { DeleteEvents } from "/imports/ui/components/courses/delete-events";
import { Modal as DeleteEventsModal } from "/imports/ui/components/courses/delete-events/modal";
import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

export interface Props {
  course: CourseModel;
}

function compareByStartDate(event1: EventModel, event2: EventModel) {
  if (event1.start < event2.start) {
    return -1;
  }
  if (event1.start > event2.start) {
    return 1;
  }
  return 0;
}

export function Events({ course }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const now = useReactiveNow();
  const viewport = useViewportSize();

  const isMobileScreen = viewport.width <= ScssVars.screenXS;
  const maxEventsShown = isMobileScreen ? 2 : 4;

  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isLoading, events] = EventsPub.useForCourse(course._id);

  function haveEvents() {
    return events.sort(compareByStartDate).some((e) => e.end >= now);
  }

  function haveMoreEvents() {
    return events.sort(compareByStartDate).filter((e) => e.end >= now).length > maxEventsShown;
  }

  function ongoingEvents() {
    return events.sort(compareByStartDate).filter((e) => e.start <= now && e.end >= now);
  }

  function futureEvents() {
    const upcomingEvents = events.sort(compareByStartDate).filter((e) => e.start > now);

    if (showAllEvents) {
      return upcomingEvents;
    }

    return upcomingEvents.slice(0, maxEventsShown);
  }

  function upcomingEventsCount() {
    return course.futureEvents;
  }
  function mayAdd() {
    return course.editableBy(user);
  }
  function haveOngoingEvents() {
    return ongoingEvents().length > 0;
  }
  function haveFutureEvents() {
    return futureEvents().length > 0;
  }
  function showHaveMoreEvents() {
    return haveMoreEvents() && !showAllEvents;
  }
  function deleteCourseEventsArgs() {
    return {
      onShowEventsDeleteModal: () => {
        setShowModal(true);
      },
    };
  }
  function deleteEventsModalArgs() {
    const upcomingEvents = events.sort(compareByStartDate).filter((e) => e.start > now);
    return {
      upcomingEvents,
      onHideEventsDeleteModal() {
        setShowModal(false);
      },
    };
  }

  return (
    <>
      {!isLoading() ? (
        haveEvents() ? (
          <div className="page-component">
            {haveOngoingEvents() ? (
              <>
                <div className="page-component-header">
                  <h4>
                    <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
                    &nbsp;
                    {t("course.events.ongoinglist", "Ongoing events")}
                  </h4>
                </div>
                <div className="course-event-list">
                  <EventList dataEvents={ongoingEvents()} />
                </div>
              </>
            ) : null}

            {haveFutureEvents() ? (
              <>
                <div className="page-component-header">
                  <h4>
                    <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>
                    &nbsp;
                    {t(
                      "course.events.upcominglist",
                      "{NUM, plural, =0{No upcoming events yet} one{1 upcoming event} other{# upcoming events} }",
                      { NUM: upcomingEventsCount() },
                    )}
                  </h4>
                </div>
                <div className="course-event-list">
                  <EventList dataEvents={futureEvents()} withDate={true} />
                </div>
                <div className="mt-2 text-center">
                  {showHaveMoreEvents() ? (
                    <button
                      type="button"
                      className="btn btn-add"
                      onClick={() => {
                        setShowAllEvents(true);
                      }}
                    >
                      {t("course.events.showAllEvents", "Show all")}
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="page-component">
            <div className="page-component-header">
              <h4>
                <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>&nbsp;
                {t("course.details.noEvents", "No events planned")}
              </h4>
            </div>
          </div>
        )
      ) : (
        <div className="page-component">
          <div className="page-component-header">
            <h4>
              <span className="fa-regular fa-calendar-days fa-fw" aria-hidden="true"></span>&nbsp;
              {t("course.details.eventsLoadingHeader", "Events")}
            </h4>
          </div>
          <LoadingRow />
        </div>
      )}

      {mayAdd() ? (
        <div className="page-component course-event-tasks">
          <Add course={course} />
          {haveEvents() ? <DeleteEvents {...deleteCourseEventsArgs()} /> : null}
          {showModal ? <DeleteEventsModal {...deleteEventsModalArgs()} /> : null}
        </div>
      ) : null}

      {!isLoading() && haveEvents() ? (
        <div className="page-component">
          <a
            href={Router.path("calCourse", course)}
            target="_blank"
            onClick={() => {
              Analytics.trackEvent(
                "Events downloads",
                "Events downloads via course details",
                Regions.findOne(course.region)?.nameEn,
              );
            }} rel="noreferrer"
          >
            {t("course.download_cal", "Download events to my calendar")}
          </a>
        </div>
      ) : null}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("CourseEvents", () => Events);
