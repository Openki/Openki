import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { Regions } from "/imports/api/regions/regions";
import { GroupModel } from "/imports/api/groups/groups";

import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { SystemRoles } from "/imports/api/groups/lib/Role";
import { isParticipant } from "/imports/api/groups/lib/isRole";
import { useSessionEquals } from "/imports/utils/react-meteor-data";
import { useSiteName } from "/imports/utils/getSiteName";

import { RoleIcon } from "/imports/ui/components/RoleIcon";

export interface Props {
  group: GroupModel;
  hideInterested: boolean;
}

export function Group({ group, hideInterested }: Props) {
  const { t } = useTranslation();
  const [isRolesLoading, regionRoles] = useRegionRoles(group.region);
  const allRegions = useSessionEquals("region", "all");
  const [isExpanded, setIsExpanded] = useState(false);
  const siteName = useSiteName();

  function regionOf() {
    return Regions.findOne(group.region)?.name;
  }
  function interestedPersons() {
    return group.membersWithRole(SystemRoles.Participant).length;
  }

  return (
    <div className="frame-list-item-group">
      <h4
        className="frame-list-item-header"
        onClick={(event) => {
          event.currentTarget.classList.toggle("active");
          setIsExpanded(!isExpanded);
        }}
      >
        <span className="frame-list-item-toggle-indicator">
          <i className="fa-solid fa-angle-down" />
        </span>
        {!hideInterested && group.roles.some(isParticipant) && (
          <span
            className="frame-list-item-interested"
            data-bs-title={t("frame.groupList.interestedPersons", "Interested people")}
          >
            <span className="me-1">{interestedPersons()}</span>{" "}
            {isRolesLoading() && (
              <RoleIcon role={SystemRoles.Participant} regionRoles={regionRoles} />
            )}
          </span>
        )}
        {group.name}
        {!!allRegions && (
          <span className="badge bg-primary frame-list-item-region">{regionOf()}</span>
        )}
      </h4>
      {isExpanded && (
        <div className="p-2">
          <div className="row">
            <div className="col-sm-2 fw-bold">{t("frame.eventsList.description")}</div>
            <div
              className="col-sm-10"
              dangerouslySetInnerHTML={{ __html: group.description || "" }}
            ></div>
          </div>
          <div className="mt-2 d-grid d-sm-flex">
            <a
              className="btn btn-outline-dark"
              href={Router.path("showGroup", group)}
              target="_blank"
              rel="noreferrer"
            >
              {t("frame.groupList.moreAboutThisGroup", "More on {SITENAME}", {
                SITENAME: siteName,
              })}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
