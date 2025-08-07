import React, { useRef } from "react";
import Collapse from "bootstrap/js/dist/collapse";
import { useTranslation } from "react-i18next";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/courses/publications";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useParams } from "/imports/utils/react-meteor-router";
import { useUser } from "/imports/utils/react-meteor-data";

import { EventRegistration } from "../../display/registration";
import { Discussion } from "../../../courses/discussion";
import { GroupList } from "../../display/group-list";
import { Display } from "../../../location/display";
import { VenueLink } from "../../../venues/link";
import { Panel } from "./panel";

import "./styles.scss";

function DisplayDiscussion({ eventId, courseId }: { eventId: string; courseId: string }) {
  const [isLoading, course] = useDetails(courseId);
  const params = useParams();

  function select() {
    return params.select;
  }

  if (isLoading() || !course || !course.singleEvent) {
    return null;
  }

  return <Discussion courseId={course._id} eventId={eventId} select={select()} />;
}
export interface Props {
  event: EventModel;
}

export function EventCompact2({ event }: Props) {
  const { timeFormat } = useDateTimeFormat();
  const { t } = useTranslation();

  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(event.region);
  const groups = event.allGroups?.filter(
    (groupId) =>
      !(
        // hide group where are from the region set
        (
          region?.defaultTeamGroups?.includes(groupId) &&
          // when user ist not member of the group or a admin
          !user?.mayPromoteWith(groupId) &&
          !event.editableBy(user)
        )
      ),
  );

  const collapseElementRef = useRef<HTMLDivElement>(null);
  return (
    <Panel
      id={event._id}
      onChange={(view) => {
        setTimeout(() => {
          if (collapseElementRef.current) {
            if (view === "full") {
              Collapse.getOrCreateInstance(collapseElementRef.current).show();
            } else {
              Collapse.getOrCreateInstance(collapseElementRef.current).hide();
            }
          }
        }, 0);
      }}
      thumb={
        <div className="card me-1" style={{ width: 320, minWidth: 320 }}>
          <div
            className="card-header card-header-img"
            style={
              event?.publicUrlForCompactImage()
                ? { backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }
                : {}
            }
          ></div>
          <div className="card-body">
            <h4 className="card-title text-truncate">{event.title}</h4>
            <p className="card-text text-truncate">
              <i className="fa-regular fa-fw fa-clock"></i> {timeFormat(event.startLocal)} -{" "}
              {timeFormat(event.endLocal)}
              {!!event.venue?.name && (
                <>
                  <br />
                  <i className="fa-solid fa-fw fa-location-dot"></i>
                  {event.venue.name}
                </>
              )}
            </p>
          </div>
        </div>
      }
      full={
        <div className="card">
          <div
            className="card-header card-header-img"
            style={{ backgroundImage: `url('${event?.publicUrlForDetailsImage()}')` }}
          ></div>
          <div className="card-body">
            <h4 className="card-title text-truncate">{event.title}</h4>
            <p className="card-text text-truncate">
              <i className="fa-regular fa-fw fa-clock"></i> {timeFormat(event.startLocal)} -{" "}
              {timeFormat(event.endLocal)}
              {!!event.venue?.name && (
                <>
                  <br />
                  <a href={"#show=" + event._id + "&place"}>
                    <i className="fa-solid fa-fw fa-location-dot"></i>
                    {event.venue.name}
                  </a>
                </>
              )}
            </p>
            <div className="collapse" ref={collapseElementRef}>
              <p className="card-text" dangerouslySetInnerHTML={{ __html: event.description }}></p>
              <p className="card-text">
                <EventRegistration event={event} />
              </p>
              {!!event.venue && (
                <>
                  <h5 id={"show=" + event._id + "&place"} className="card-title">
                    Place
                  </h5>
                  <p className="card-text">
                    <div className="tag-group multiline">
                      <VenueLink venue={event.venue} room={event.room} />
                      {!!event.venue?.address && (
                        <div className="tag">
                          <span
                            className="fa-solid fa-location-dot fa-fw"
                            aria-hidden="true"
                          ></span>
                          {event.venue.address}
                        </div>
                      )}
                    </div>
                    {!!event.venue?.loc?.coordinates && (
                      <Display coordinates={event.venue?.loc?.coordinates} />
                    )}
                  </p>
                </>
              )}

              {!!event.courseId && (
                <p className="card-text">
                  <DisplayDiscussion courseId={event.courseId} eventId={event._id} />
                </p>
              )}
              {!isRegionLoading() && !!groups?.length && (
                <>
                  <h5 className="card-title">Groups</h5>
                  <p className="card-text">
                    <GroupList event={event} />
                  </p>
                </>
              )}
              {!!event.categories?.length && (
                <>
                  <h5 className="card-title">{t("event.details.categories", "Categories")}</h5>
                  <p className="card-text">
                    {event.categories.map((category) => t(`category.${category}`)).join(", ")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}
