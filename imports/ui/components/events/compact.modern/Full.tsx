import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { useSiteName } from "/imports/utils/getSiteName";
import { isEmpty, omitBy, isNil } from "lodash-es";

import { EventModel } from "/imports/api/events/events";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { RegistrationParticipants } from "../display/registration.modern";
import { Discussion } from "../../groups/discussion.modern";
import { Display } from "../../location/display";

import { OrganizationName } from "../../OrganizationName";
import { useDetails } from "/imports/api/groups/publications";
import { StatePanel } from "./StatePanel";
import { CustomFieldDisplay } from "../../groups/CustomFieldDisplay";
import { ReactJoin } from "/imports/utils/ReactJoin";
import { ImagePlaceholder } from "../../ImagePlaceholder";

function DisplayDiscussion({ eventId, groupId }: { eventId: string; groupId: string }) {
  const [isLoading, group] = useDetails(groupId);

  if (isLoading() || !group || !group.singleEvent) {
    return null;
  }

  return <Discussion groupId={group._id} eventId={eventId} />;
}

export function Full({
  event,
  hideCategories,
}: {
  event: EventModel;
  hideCategories?: boolean | undefined;
}) {
  const { timeFormat, dateFormat } = useDateTimeFormat();
  const { t } = useTranslation();
  const siteName = useSiteName();
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(event.region);
  const visibleOrganizations = event.allOrganizations?.filter(
    (organizationId) =>
      // hide organization where are from the region set
      !(
        region?.defaultTeamOrganizations?.includes(organizationId) &&
        // when user is not member of the organization or a admin
        !user?.canPromoteWith(organizationId) &&
        !event.editableBy(user)
      ),
  );

  const organizedByOrganizations = visibleOrganizations?.filter((organization) =>
    event.editors.includes(organization),
  );
  const locationPreview = event.venue?.name || event.venue?.address;

  return (
    <div className="card">
      {event?.publicUrlForDetailsImage() ? (
        <div
          className="position-relative card-header bg-img-cover border-bottom"
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
      <div className="card-body animated-bg bg-event">
        <h3 className="card-title min-h-[2lh] fw-bold">{event.title}</h3>
        <p className="card-text">
          <div className="panel-show-line-1">
            <i className="fa-regular fa-fw fa-calendar" /> {dateFormat(event.startLocal)}
          </div>
          <i className="fa-regular fa-fw fa-clock" /> {timeFormat(event.startLocal)} -{" "}
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
                <i className="fa-solid fa-fw fa-location-dot" />
                {locationPreview}
              </a>
            </>
          )}
          {/* Force the same height if no value is set for venue */}
          &nbsp;
        </p>
        <p className="card-text" dangerouslySetInnerHTML={{ __html: event.description }}></p>
        {!!event.groupId && (
          <CustomFieldDisplay groupId={event.groupId} customClassName="card-text mb-1" />
        )}

        {event.editableBy(user) && (
          <h4 className="card-title mt-3">
            {t("event.details.yourAreTeam", "You are part of the coordination-team")}{" "}
            <a
              className="btn btn-sm btn-secondary"
              href={Router.path("showEvent", event, { query: { edit: "1" } })}
              target="_blank"
              rel="noreferrer"
            >
              {t("frame.program.editMode", "Edit mode", {
                SITENAME: siteName,
              })}{" "}
              <i className="fa-fw fa-solid fa-arrow-up-right-from-square" />
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
              <i className="fa-solid fa-fw fa-location-dot" />
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

        {!isRegionLoading() && !!organizedByOrganizations?.length && (
          <p className="card-text">
            <span className="fw-bold">{t("event.details.organizedBy", "Organized by:")}</span>{" "}
            {ReactJoin(
              organizedByOrganizations.map((organization) => (
                <OrganizationName key={organization} id={organization} />
              )),
            )}
          </p>
        )}

        {!!event.groupId && <DisplayDiscussion groupId={event.groupId} eventId={event._id} />}

        {!hideCategories && !!event.categories?.length && (
          <p className="card-text">
            <span className="fw-bold">{t("event.details.categories", "Categories:")}</span>{" "}
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
            <i className="fa-fw fa-solid fa-arrow-up-right-from-square" />
          </a>
        </p>
      </div>
    </div>
  );
}
