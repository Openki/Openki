import React, { useEffect, useRef, useState } from "react";
import Collapse from "bootstrap/js/dist/collapse";
import scrollIntoView from "scroll-into-view-if-needed";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/courses/publications";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useHash, useParams } from "/imports/utils/react-meteor-router";

import { EventRegistration } from "../../display/registration";
import { Discussion } from "../../../courses/discussion";

import "./styles.scss";
import { GroupList } from "../../display/group-list";
import { Display } from "../../../location/display";
import { VenueLink } from "../../../venues/link";
import { CourseCategories } from "../../../courses/categories";
import { useUser } from "/imports/utils/react-meteor-data";

function Panel({
  id,
  thumb,
  full,
  onChange,
}: {
  id: string;
  thumb: any;
  full: any;
  onChange: (view: "thumb" | "full") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [close, setClose] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);

  const hash = (useHash() as string).slice(1);
  const hashParams = new URLSearchParams(hash);
  const isShowed = id === hashParams.get("show");
  useEffect(() => {
    onChange(isShowed ? "full" : "thumb");
    if (isShowed) {
      if (thumbRef.current) {
        scrollIntoView(thumbRef.current, {
          block: "nearest",
          inline: "nearest",
          scrollMode: "if-needed",
          behavior: "smooth" as ScrollBehavior,
        });
      }
      setExpanded(true);
    } else {
      setClose(true);
    }
  }, [isShowed]);

  useEffect(() => {
    if (expanded) {
      setTimeout(() => {
        fullRef.current?.classList.add("panel-animation");
      }, 0);
    }
  }, [expanded]);
  useEffect(() => {
    if (close) {
      fullRef.current?.classList.remove("panel-animation");
      setTimeout(() => {
        setExpanded(false);
        setClose(false);
      }, 350);
    }
  }, [close]);

  return (
    <div className="panel">
      <div className="panel-thumb" ref={thumbRef}>
        <div
          className="panel-thumb-body"
          onClick={() => {
            location.hash = "show=" + id;
          }}
        >
          {thumb}
        </div>
      </div>
      {expanded && (
        <div ref={fullRef}>
          <div
            className="panel-full-bg"
            onClick={() => {
              location.hash = "";
            }}
          >
            <div
              className="panel-full"
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                left: thumbRef.current?.getBoundingClientRect().left,
                right: thumbRef.current?.getBoundingClientRect().right,
                width: thumbRef.current?.clientWidth,
                top: thumbRef.current?.getBoundingClientRect().top,
                height: thumbRef.current?.clientHeight,
              }}
            >
              <div className="panel-full-body">
                {full}
                <div
                  className="panel-minimize display-4"
                  onClick={() => {
                    location.hash = "";
                  }}
                >
                  <i className="fa-solid fa-minimize"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
}
//
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
            style={{ backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }}
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
                  <h5 className="card-title">Categories</h5>
                  <p className="card-text">
                    <CourseCategories categories={event.categories} />
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
