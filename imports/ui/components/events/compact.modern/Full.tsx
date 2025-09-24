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

import { RegistrationParticipants } from "../display/registration.modern";
import { Discussion } from "../../courses/discussion.modern";
import { Display } from "../../location/display";

import { GroupName } from "./GroupName";
import { useDetails } from "/imports/api/courses/publications";
import { StatePanel } from "./StatePanel";
import { CustomFieldDisplay } from "../../courses/CustomFieldDisplay";
import { ReactJoin } from "/imports/utils/ReactJoin";
import { ImagePlaceholder } from "./ImagePlaceholder";

function DisplayDiscussion({ eventId, courseId }: { eventId: string; courseId: string }) {
  const [isLoading, course] = useDetails(courseId);

  if (isLoading() || !course || !course.singleEvent) {
    return null;
  }

  return <Discussion courseId={course._id} eventId={eventId} />;
}

export function Full({
  event,
  animation,
  hideCategories,
}: {
  event: EventModel;
  animation: "show" | "hide";
  hideCategories?: boolean | undefined;
}) {
  const { timeFormat, dateFormat } = useDateTimeFormat();
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
  const locationPreview = [event.venue?.name, event.venue?.address].filter((v) => v)[0];

  return (
    <div className="card">
      {event?.publicUrlForDetailsImage() ? (
        <div
          className="position-relative card-header card-header-img bg-img-cover border-bottom"
          style={{
            backgroundImage: `url('${event.publicUrlForDetailsImage()}'), url('${event.publicUrlForCompactImage()}')`,
          }}
        >
          <StatePanel event={event} />
        </div>
      ) : (
        <ImagePlaceholder seed={event._id} regionId={event.region}>
          <StatePanel event={event} />
        </ImagePlaceholder>
      )}
      <div className="card-body">
        <h3 className="card-title min-h-2l fw-bold">{event.title}</h3>
        <p className="card-text">
          <div className="panel-calendar">
            <i className="fa-regular fa-fw fa-calendar"></i> {dateFormat(event.startLocal)}
          </div>
          <i className="fa-regular fa-fw fa-clock"></i> {timeFormat(event.startLocal)} -{" "}
          {timeFormat(event.endLocal)}
          <br />
          {!!locationPreview && (
            <>
              <a
                href="#"
                onClick={(ev) => {
                  ev.preventDefault();

                  document
                    .querySelector(`#place`)
                    ?.scrollIntoView({ block: "center", behavior: "smooth" });
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
            <CustomFieldDisplay courseId={event.courseId} customClassName="card-text mb-1" />
          )}

          {event.editableBy(user) && (
            <h4 className="card-title mt-3">
              {t("event.details.yourAreOrganizer", "You are organizer")}{" "}
              <a
                className="btn btn-sm btn-secondary"
                href={Router.path("showEvent", event, { query: { edit: "1" } })}
                target="_blank"
                rel="noreferrer"
              >
                {t("frame.program.editMode", "Edit mode", {
                  SITENAME: siteName,
                })}{" "}
                <i className="fa-fw fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </h4>
          )}

          <hr className="hr-flush border-dark" />

          <RegistrationParticipants event={event} />

          <hr className="hr-flush border-dark" />

          {!!event.venue && !isEmpty(omitBy(event.venue, isNil)) && (
            <>
              <h4 className="card-title">{t("event.details.location", "Location")}</h4>
              <p id="place" className="card-text">
                <i className="fa-solid fa-fw fa-location-dot"></i>
                {[event.venue.name, event.venue.address].filter((v) => v).join(", ")}
                {!!event.room && (
                  <>
                    <br />
                    {t("event.details.room", "Room:")} {event.room}
                  </>
                )}
                {!!event.venue?.loc?.coordinates && (
                  <Display
                    region={event.region}
                    level={event.venue.level}
                    coordinates={event.venue?.loc?.coordinates}
                  />
                )}
              </p>
            </>
          )}

          {!isRegionLoading() && !!organizedByGroups?.length && (
            <p className="card-text">
              <strong>{t("event.details.organziedBy", "Organized by:")}</strong>{" "}
              {ReactJoin(organizedByGroups.map((group) => <GroupName key={group} id={group} />))}
            </p>
          )}

          {!!event.courseId && <DisplayDiscussion courseId={event.courseId} eventId={event._id} />}

          {!hideCategories && !!event.categories?.length && (
            <p className="card-text">
              <strong>{t("event.details.categories", "Categories:")}</strong>{" "}
              {event.categories.map((category) => t(`category.${category}`)).join(", ")}
            </p>
          )}

          <hr className="hr-flush border-dark" />

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
