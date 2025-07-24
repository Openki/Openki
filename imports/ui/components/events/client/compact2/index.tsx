import React, { useRef, useState } from "react";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/courses/publications";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useParams } from "/imports/utils/react-meteor-router";

import { EventRegistration } from "../../display/registration";
import { Report } from "/imports/ui/components/report";
import { Discussion } from "../../../courses/discussion";

import "./styles.scss";
import { GroupList } from "../../display/group-list";
import { Display } from "../../../location/display";
import { VenueLink } from "../../../venues/link";
import { CourseCategories } from "../../../courses/categories";

function Panel({ thumb, full }: { thumb: any; full: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="panel">
      <div className="panel-thumb">
        <div
          className="panel-thumb-body"
          onClick={() => {
            setExpanded(true);
          }}
        >
          {thumb}
        </div>
      </div>
      {expanded && (
        <div className="panel-full">
          <div
            className="panel-full-body"
            onClick={() => {
              setExpanded(false);
            }}
          >
            <div className="container">
              {full}
              <div
                className="panel-minimize display-4"
                onClick={() => {
                  setExpanded(false);
                }}
              >
                <i className="fa-solid fa-minimize"></i>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => {
              setExpanded(false);
            }}
          ></div>
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

  return (
    <Panel
      thumb={
        <div className="card">
          <div
            className="card-header card-header-img"
            style={{ backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }}
          ></div>
          <div className="card-body">
            <h5 className="card-title text-truncate">{event.title}</h5>
            <p className="card-text text-truncate">
              {timeFormat(event.startLocal)} - {timeFormat(event.endLocal)}
              <br />
              {!!event.venue?.name && <>{event.venue.name}</>}
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
            <h5 className="card-title text-truncate">{event.title}</h5>
            <p className="card-text text-truncate">
              {timeFormat(event.startLocal)} - {timeFormat(event.endLocal)}
              <br />
              {!!event.venue?.name && <>{event.venue.name}</>}
            </p>
          </div>
          <div className="collapse" id={"collapseExample" + event._id}>
            <div className="card-body">
              <p className="card-text" dangerouslySetInnerHTML={{ __html: event.description }}></p>
              <EventRegistration event={event} />
              <p className="card-text">
                <div className="tag-group multiline">
                  {!!event.venue && <VenueLink venue={event.venue} room={event.room} />}
                </div>
                {!!event.venue?.address && (
                  <div className="tag">
                    <span className="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
                    {event.venue.address}
                  </div>
                )}
              </p>
              {!!event.venue?.loc?.coordinates && (
                <Display coordinates={event.venue?.loc?.coordinates} />
              )}
              {!!event.courseId && (
                <DisplayDiscussion courseId={event.courseId} eventId={event._id} />
              )}
              <GroupList event={event} />
              <CourseCategories categories={event.categories} />
              <Report />
            </div>
          </div>
        </div>
      }
    />
  );

  // const [a, setA] = useState(false);
  // const elementRef = useRef<HTMLDivElement>(null);

  // return (
  //   <div ref={elementRef} className={"me-2 panel " + (!a ? "panel-small" : "panel-extended")}>
  //     <div className="card">
  //       <div
  //         className="card-header card-header-img"
  //         style={{ backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }}
  //       ></div>
  //       <div className="card-body">
  //         <h5 className="card-title text-truncate">
  //           {
  //             <a
  //               className="stretched-link"
  //               data-bs-toggle="collapse"
  //               href={"#collapseExample" + event._id}
  //               role="button"
  //               aria-expanded="false"
  //               aria-controls={"collapseExample" + event._id}
  //               onClick={() => {
  //                 const element = elementRef.current;
  //                 if (element) {
  //                   if (!a) {
  //                     element.style.left = element?.offsetLeft + "px";
  //                     element.style.top = element?.offsetTop + "px";
  //                     element.style.position = "fixed";
  //                   } else {
  //                     setTimeout(() => {
  //                       element.style.position = "static";
  //                     }, 350);
  //                   }
  //                 }

  //                 setA(!a);
  //               }}
  //             >
  //               {event.title}
  //             </a>
  //           }
  //         </h5>
  //         <p className="card-text text-truncate">
  //           {timeFormat(event.startLocal)} - {timeFormat(event.endLocal)}
  //           <br />
  //           {!!event.venue?.name && <>{event.venue.name}</>}
  //         </p>
  //       </div>
  //       <div className="collapse" id={"collapseExample" + event._id}>
  //         <div className="card-body">
  //           <p className="card-text" dangerouslySetInnerHTML={{ __html: event.description }}></p>
  //           <EventRegistration event={event} />
  //           <p className="card-text">
  //             <div className="tag-group multiline">
  //               {!!event.venue && <VenueLink venue={event.venue} room={event.room} />}
  //             </div>
  //             {!!event.venue?.address && (
  //               <div className="tag">
  //                 <span className="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
  //                 {event.venue.address}
  //               </div>
  //             )}
  //           </p>
  //           {!!event.venue?.loc?.coordinates && (
  //             <Display coordinates={event.venue?.loc?.coordinates} />
  //           )}
  //           {!!event.courseId && (
  //             <DisplayDiscussion courseId={event.courseId} eventId={event._id} />
  //           )}
  //           <GroupList event={event} />
  //           <CourseCategories categories={event.categories} />
  //           <Report />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}
