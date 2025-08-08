import React, { useEffect, useRef } from "react";
import Collapse from "bootstrap/js/dist/collapse";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useSiteName } from "/imports/utils/getSiteName";
import { isEmpty, isNil, omitBy } from "lodash";

import { EventModel } from "/imports/api/events/events";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { useUser } from "/imports/utils/react-meteor-data";

import { RegistrationParticipants } from "../../display/registration.modern";
import { Discussion } from "../../../courses/client/discussion.modern";
import { Display } from "../../../location/display";

import { GroupName } from "./GroupName";
import { useParams } from "/imports/utils/react-meteor-router";
import { useDetails } from "/imports/api/courses/publications";
import { StatePanel } from "./StatePanel";
import { CustomFieldDisplay } from "../../../courses/CustomFieldDisplay";

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

export function Full({ event, animation }: { event: EventModel; animation: "show" | "hide" }) {
  const { timeFormat } = useDateTimeFormat();
  const { t } = useTranslation();
  const siteName = useSiteName();
  const user = useUser();
  const collapseElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (collapseElementRef.current) {
        if (animation === "show") {
          Collapse.getOrCreateInstance(collapseElementRef.current).show();
        } else {
          Collapse.getOrCreateInstance(collapseElementRef.current).hide();
        }
      }
    }, 1);
  }, [animation]);

  const [isRegionLoading, region] = useRegionDetails(event.region);
  const visibleGroups = event.allGroups?.filter(
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

  const organizedByGroups = visibleGroups?.filter((group) => event.editors.includes(group));
  const promotedByGroups = visibleGroups?.filter((group) => !event.editors.includes(group));
  const locationPreview = [event.venue?.name, event.venue?.address].filter((v) => v)[0];

  return (
    <div className="card">
      <div
        className="position-relative card-header card-header-img"
        style={
          event?.publicUrlForCompactImage()
            ? { backgroundImage: `url('${event?.publicUrlForCompactImage()}')` }
            : {}
        }
      >
        <StatePanel event={event} />
      </div>
      <div className="card-body">
        <h3 className="card-title">{event.title}</h3>
        <p className="card-text">
          <i className="fa-regular fa-fw fa-clock"></i> {timeFormat(event.startLocal)} -{" "}
          {timeFormat(event.endLocal)}
          <br />
          {!!locationPreview && (
            <>
              <a
                href={`#show=${event._id}&place`}
                onClick={() => {
                  // Fix: Remove this entry from browser history. Otherwise, nothing will happen on history back.
                  setTimeout(() => {
                    history.back();
                  }, 0);
                }}
              >
                <i className="fa-solid fa-fw fa-location-dot"></i>
                {locationPreview}
              </a>
            </>
          )}
          {/* Force the same height if no value is set for venue */}
          &nbsp;
        </p>
        <div className="collapse" ref={collapseElementRef}>
          <p className="card-text" dangerouslySetInnerHTML={{ __html: event.description }}></p>
          {!!event.courseId && (
            <CustomFieldDisplay courseId={event.courseId} customClassName="card-text" />
          )}
          <p className="card-text">
            <RegistrationParticipants event={event} />
          </p>
          {!!event.venue && !isEmpty(omitBy(event.venue, isNil)) && (
            <>
              <h4 id={`show=${event._id}&place`} className="card-title">
                {t("event.details.location", "Location")}
              </h4>
              <p className="card-text">
                <i className="fa-solid fa-fw fa-location-dot"></i>
                {[event.venue.name, event.venue.address].filter((v) => v).join(", ")}
                {!!event.room && (
                  <>
                    <br />
                    {t("event.details.room", "Room: ")} {event.room}
                  </>
                )}
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
          {!isRegionLoading() && !!organizedByGroups?.length && (
            <>
              <h4 className="card-title">{t("event.details.organziedBy", "Organized by")}</h4>
              <p className="card-text">
                {organizedByGroups
                  .map((group) => <GroupName key={group} id={group} />)
                  .reduce((prev, curr) => (
                    <>
                      {prev}, {curr}
                    </>
                  ))}
              </p>
            </>
          )}
          {!isRegionLoading() && !!promotedByGroups?.length && (
            <>
              <h4 className="card-title">{t("event.details.promotedBy", "Promoted by")}</h4>
              <p className="card-text">
                {promotedByGroups
                  .map((group) => <GroupName key={group} id={group} />)
                  .reduce((prev, curr) => (
                    <>
                      {prev}, {curr}
                    </>
                  ))}
              </p>
            </>
          )}
          {!!event.categories?.length && (
            <>
              <h4 className="card-title">{t("event.details.categories", "Categories")}</h4>
              <p className="card-text">
                {event.categories.map((category) => t(`category.${category}`)).join(", ")}
              </p>
            </>
          )}
          <hr className="border-dark" />
          <p className="card-text text-center mb-0">
            <a
              className="btn btn-secondary"
              href={Router.path("showEvent", event)}
              target="_blank"
              rel="noreferrer"
            >
              {t("frame.calendar.moreAboutThisEvent", "More about this event on {SITENAME}", {
                SITENAME: siteName,
              })}{" "}
              <i className="fa-fw fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
