import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { Router } from "meteor/iron:router";

import * as Analytics from "/imports/ui/lib/analytics";

import * as EventsPub from "/imports/api/events/publications";
import { Regions } from "/imports/api/regions/regions";
import { GroupModel } from "/imports/api/groups/groups";
import { EventModel } from "/imports/api/events/events";

import { useReactiveNow } from "/imports/utils/reactive-now";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Add } from "./add";
import { DeleteEvents } from "../delete-events";
import { Modal as DeleteEventsModal } from "../delete-events/modal";
import { EventList } from "/imports/ui/components/events/list";

import "./styles.scss";

export interface Props {
  group: GroupModel;
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

export function Events({ group }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const now = useReactiveNow();
  const viewport = useViewportSize();

  const isMobileScreen = viewport.width <= ScssVars.screenXS;
  const maxEventsShown = isMobileScreen ? 2 : 4;

  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isLoading, events] = EventsPub.useForGroup(group._id);

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
    return group.futureEvents;
  }
  function canAdd() {
    return group.editableBy(user);
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
  function deleteGroupEventsArgs() {
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
            {haveOngoingEvents() && (
              <>
                <div className="page-component-header">
                  <h4>
                    <i className="fa-regular fa-calendar-days fa-fw" />
                    &nbsp;
                    {t("group.events.ongoinglist", "Ongoing events")}
                  </h4>
                </div>
                <div className="group-event-list">
                  <EventList dataEvents={ongoingEvents()} />
                </div>
              </>
            )}

            {haveFutureEvents() && (
              <>
                <div className="page-component-header event-display-container">
                  <h4>
                    <i className="fa-regular fa-calendar-days fa-fw" />
                    &nbsp;
                    {t(
                      "group.events.upcominglist",
                      "{NUM, plural, =0{No upcoming events yet} one{1 upcoming event} other{# upcoming events} }",
                      { NUM: upcomingEventsCount() },
                    )}
                  </h4>
                  <div>
                    {haveEvents() && <DeleteEvents {...deleteGroupEventsArgs()} />}
                    {showModal && <DeleteEventsModal {...deleteEventsModalArgs()} />}
                  </div>
                </div>
                <div className="group-event-list">
                  <EventList dataEvents={futureEvents()} withDate={true} />
                </div>
                <div className="mt-2 text-center">
                  {showHaveMoreEvents() && (
                    <button
                      type="button"
                      className="btn btn-add"
                      onClick={() => {
                        setShowAllEvents(true);
                      }}
                    >
                      {t("group.events.showAllEvents", "Show all")}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="page-component">
            <div className="page-component-header">
              <h4>
                <i className="fa-regular fa-calendar-days fa-fw" />
                &nbsp;
                {t("group.details.noEvents", "No events planned")}
              </h4>
            </div>
          </div>
        )
      ) : (
        <div className="page-component">
          <div className="page-component-header">
            <h4>
              <i className="fa-regular fa-calendar-days fa-fw" />
              &nbsp;
              {t("group.details.eventsLoadingHeader", "Events")}
            </h4>
          </div>
          <LoadingRow />
        </div>
      )}

      {canAdd() && (
        <div className="page-component">
          <Add group={group} />
       </div>
      )}

      {!isLoading() && haveEvents() && (
        <div className="page-component">
          <a
            href={Router.path("calGroup", group)}
            target="_blank"
            onClick={() => {
              Analytics.trackEvent(
                "Events downloads",
                "Events downloads via group details",
                Regions.findOne(group.region)?.nameEn,
              );
            }}
            rel="noreferrer"
          >
            {t("group.download_cal", "Download events to my calendar")}
          </a>
        </div>
      )}
    </>
  );
}
