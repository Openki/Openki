import React, { useRef } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

import { GroupModel } from "/imports/api/groups/groups";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { hasRole } from "/imports/api/groups/lib/hasRole";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";

import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { SingleEventIndicator } from "/imports/ui/components/single-event-indicator";
import { GroupCategories } from "../categories";
import { OrganizationTag } from "../../organizations/tag";
import { GroupCompactEvent } from "./group-compact-event";
import { GroupCompactRoles } from "./group-compact-roles";

import "./styles.scss";

export interface Props {
  group: GroupModel;
  organizationTagEvents?:
    | ((organizationId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
  categoryTagEvents?:
    | ((organizationId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
}

export function GroupCompact({ group, organizationTagEvents, categoryTagEvents }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  const [isRegionLoading, region] = useRegionDetails(group?.region);
  const [isRegionRolesLoading, regionRoles] = useRegionRoles(group?.region);

  function groupCss() {
    if (!group.nextEvent) {
      return {};
    }

    const src = group?.publicUrlForCompactImage();
    if (!src) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };
  }

  function groupStateClasses() {
    const classes = [];

    switch (group.hasState()) {
      case "proposal":
        classes.push("is-proposal");
        break;
      case "upcomingEvent":
        classes.push("has-upcoming-events");
        break;
      case "resting":
        classes.push("has-past-events");
        break;
      default:
        throw new Error(`Unexpected value for group state: ${group.hasState()}`);
    }

    if (group.archived) {
      classes.push("is-archived");
    }

    return classes.join(" ");
  }

  function filterPreviewClasses() {
    const classes = [];

    const roles = regionRoles.map((role) => role.id);

    roles.forEach((role) => {
      const roleDisengaged = !hasRole(group.members, role);
      if (group.roles.includes(role) && roleDisengaged) {
        classes.push(`needs-role-${role}`);
      }
    });

    group.categories?.forEach((category) => {
      classes.push(`category-${category}`);
    });

    group.organizations?.forEach((organization) => {
      classes.push(`organization-${organization}`);
    });

    classes.push(`region-${group.region}`);

    return classes.join(" ");
  }

  function organizationTagAttr(organizationId: string) {
    return {
      organizationId,
      isTeam: group.teamOrganizations.includes(organizationId),
      onClick: async () => {
        await organizationTagEvents?.(organizationId).onClick();
      },
      onMouseOver: async () => {
        elementRef.current?.classList.add("elevate-child");
        await organizationTagEvents?.(organizationId).onMouseOver();
      },
      onMouseOut: async () => {
        elementRef.current?.classList.remove("elevate-child");
        await organizationTagEvents?.(organizationId).onMouseOut();
      },
    };
  }

  const organizations = group.organizations.filter(
    (organizationId) =>
      !(
        // hide organization where are from the region set
        region?.defaultTeamOrganizations?.includes(organizationId) &&
        // when user ist not member of the organization or a admin
        !user?.canPromoteWith(organizationId) &&
        !group.editableBy(user)
      ),
  );

  return (
    <div
      ref={elementRef}
      className={cx(
        "row mx-0 align-items-start group-compact",
        groupStateClasses(),
        !isRegionRolesLoading() && filterPreviewClasses(),
      )}
      style={groupCss()}
    >
      <div className={cx("group-compact-content", !group.nextEvent ? "col-10" : "col-8")}>
        {group.internal && <InternalIndicator />}
        {group.singleEvent && <SingleEventIndicator />}
        <div className="group-compact-title" title={group.name}>
          <a className="stretched-link" href={Router.path("showGroup", group)}>
            {group.name}
          </a>
        </div>
        <GroupCategories
          categories={group.categories}
          onClick={async (category) => {
            categoryTagEvents?.(category).onClick();
          }}
          onMouseOver={async (category) => {
            elementRef.current?.classList.add("elevate-child");
            categoryTagEvents?.(category).onMouseOver();
          }}
          onMouseOut={async (category) => {
            elementRef.current?.classList.remove("elevate-child");
            categoryTagEvents?.(category).onMouseOut();
          }}
        />
      </div>
      {group.nextEvent ? (
        <GroupCompactEvent event={group.nextEvent} />
      ) : (
        <GroupCompactRoles group={group} />
      )}
      {!isRegionLoading() && (
        <div className="tag-group group-organizations">
          {organizations.map((organization) => (
            <OrganizationTag key={organization} {...organizationTagAttr(organization)} />
          ))}
        </div>
      )}
    </div>
  );
}
