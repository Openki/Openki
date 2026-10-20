import React, { useEffect, useRef } from "react";
import { Collapse } from "/imports/startup/client/bootstrap";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { useDetails as useRegionDetails } from "/imports/api/regions/publications";
import { GroupModel } from "/imports/api/groups/groups";

import { useSiteName } from "/imports/utils/getSiteName";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { ReactJoin } from "/imports/utils/ReactJoin";
import { useDateTimeFormat } from "/imports/ui/hooks/useDateTimeFormat";
import { cx } from "/imports/utils/cx";

import { Discussion } from "../../groups/discussion.modern";
import { CustomFieldDisplay } from "../../groups/CustomFieldDisplay";
import { ImagePlaceholder } from "/imports/ui/components/ImagePlaceholder";
import { OrganizationName } from "/imports/ui/components/OrganizationName";
import { Roles } from "./roles";

export function Full({ group, animation }: { group: GroupModel; animation: "show" | "hide" }) {
  const { t } = useTranslation();
  const { dateFormat, timeFormat } = useDateTimeFormat();
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

  const [isRegionLoading, region] = useRegionDetails(group.region);
  const visibleOrganizations = group.organizations?.filter(
    (organizationId) =>
      // hide organization where are from the region set
      !(
        region?.defaultTeamOrganizations?.includes(organizationId) &&
        // when user is not member of the organization or a admin
        !user?.canPromoteWith(organizationId) &&
        !group.editableBy(user)
      ),
  );

  const organizedByOrganizations = visibleOrganizations?.filter((organization) =>
    group.editors.includes(organization),
  );

  const locationPreview = group.nextEvent?.venue?.name || group.nextEvent?.venue?.address;

  return (
    <div className="card">
      {group?.publicUrlForDetailsImage() ? (
        <div
          className="position-relative card-header bg-img-cover border-bottom"
          style={{
            backgroundImage: `url('${group.publicUrlForDetailsImage()}'), url('${group.publicUrlForCompactImage()}')`,
          }}
        />
      ) : (
        <ImagePlaceholder seed={group._id} regionId={group.region} />
      )}
      <div
        className={cx("card-body animated-bg", group.hasState() === "upcomingEvent" && "bg-group")}
      >
        <h3 className="card-title min-h-[2lh] fw-bold">{group.name}</h3>
        <div className="panel-hide-line-1">
          <i className="fs-4 fa-solid fa-arrow-right-long" />
        </div>
        <div className="collapse" ref={collapseElementRef}>
          <p
            className="card-text"
            dangerouslySetInnerHTML={{ __html: group.description || "" }}
          ></p>
          {!!group._id && (
            <CustomFieldDisplay groupId={group._id} customClassName="card-text mb-1" />
          )}

          {group.editableBy(user) && (
            <a
              className="btn btn-sm btn-secondary"
              href={Router.path("showGroup", group, { query: { edit: "1" } })}
              target="_blank"
              rel="noreferrer"
            >
              {t("groups.details.editMode", "Edit mode", {
                SITENAME: siteName,
              })}{" "}
              <i className="fa-fw fa-solid fa-arrow-up-right-from-square" />
            </a>
          )}

          <hr className="hr-flush border-dark" />

          <div className="mw-sm">
            <Roles group={group} />
          </div>

          <hr className="hr-flush border-dark" />

          {group.nextEvent && (
            <>
              <h4 className="card-title">{t("groups.details.nextEvent", "Next event")}</h4>
              <div className="card d-inline-flex border-2">
                <div className="card-body bg-event">
                  <i className="fa-regular fa-fw fa-calendar" />{" "}
                  {dateFormat(group.nextEvent.startLocal)} ·{" "}
                  {timeFormat(group.nextEvent.startLocal)}
                  <br />
                  {!!locationPreview && (
                    <>
                      <i className="fa-solid fa-fw fa-location-dot" />
                      {locationPreview}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {!isRegionLoading() && !!organizedByOrganizations?.length && (
            <p className="card-text">
              <strong>{t("groups.details.organizedBy", "Organized by:")}</strong>{" "}
              {ReactJoin(
                organizedByOrganizations.map((organization) => (
                  <OrganizationName key={organization} id={organization} />
                )),
              )}
            </p>
          )}

          {group.members.some((m) => m.user === user?._id) && (
            <>
              <hr className="hr-flush border-dark" />
              <Discussion groupId={group._id} />
            </>
          )}

          <hr className="hr-flush border-dark" />

          <p className="card-text text-center mb-0">
            <a
              className="btn btn-secondary"
              href={Router.path("showGroup", group)}
              target="_blank"
              rel="noreferrer"
            >
              {t("groups.details.moreAboutThisGroup", "More about this group on {SITENAME}", {
                SITENAME: siteName,
              })}{" "}
              <i className="fa-fw fa-solid fa-arrow-up-right-from-square" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
