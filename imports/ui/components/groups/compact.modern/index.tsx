import React, { Fragment } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";
import { GroupModel } from "/imports/api/groups/groups";
import { Router } from "meteor/iron:router";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { hasRole } from "/imports/utils/group-role-utils";
import { cx } from "/imports/utils/cx";
import { useRegionRoles } from "/imports/ui/lib/useRegionRoles";
import { ReactJoin } from "/imports/utils/ReactJoin";

export function Roles({ group }: { group: GroupModel }) {
  const [isLoading, roles] = useRegionRoles(group.region);

  const { roleNeeded } = useRoleDisplay(roles);

  return (
    <>
      {!isLoading() &&
        roles
          .filter((role) => group.roles.includes(role.type) && !hasRole(group.members, role.type))
          .map((role) => (
            <Fragment key={role.type}>
              <i className={cx(role.icon, "fa-fw")} /> {roleNeeded(role.type)}
              <br />
            </Fragment>
          ))}
    </>
  );
}

export function GetInvolved({ group }: { group: GroupModel }) {
  const [isLoading, roles] = useRegionRoles(group.region);

  const { roleGetInvolved } = useRoleDisplay(roles);

  return (
    <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center">
      {!isLoading() &&
        ReactJoin(
          [
            <a key="participant" href="#" className="btn btn-info">
              {roleGetInvolved("participant")}
            </a>,
            roles
              .filter(
                (role) =>
                  role.type !== "participant" &&
                  group.roles.includes(role.type) &&
                  !hasRole(group.members, role.type),
              )
              .map((role) => (
                <a key={role.type} href="#" className="btn btn-info">
                  {roleGetInvolved(role.type)}
                </a>
              ))[0],
          ],
          <>or</>,
        )}
    </div>
  );
}

export function GroupCompact({
  group,
  showDescription,
  showNeededRoles,
  showHowToGetInvolved,
}: {
  group: GroupModel;
  showDescription?: boolean | undefined;
  showNeededRoles?: boolean | undefined;
  showHowToGetInvolved?: boolean | undefined;
}) {
  const viewport = useViewportSize();
  const isMobileScreen = viewport.width <= ScssVars.screenSM;

  return (
    <div
      className="card me-1"
      style={isMobileScreen ? { width: 270, minWidth: 270 } : { width: 320, minWidth: 320 }}
    >
      {group?.publicUrlForCompactImage() ? (
        <div
          className="position-relative card-header bg-img-cover border-bottom"
          style={{ backgroundImage: `url('${group.publicUrlForCompactImage()}')`, height: "160px" }}
        />
      ) : (
        <ImagePlaceholder seed={group._id} regionId={group.region} />
      )}
      <div className="card-body">
        <h3 className="card-title line-clamp-2 min-h-[2lh] fw-bold">
          <a className="stretched-link text-body" href={Router.path("showGroup", group)}>
            {group.name}
          </a>
        </h3>
        {showDescription && (
          <p
            className="card-text line-clamp-3"
            dangerouslySetInnerHTML={{ __html: group.description || "" }}
          />
        )}
        {showNeededRoles && (
          <p className="card-text text-transparent">
            <Roles group={group} />
          </p>
        )}
        {showHowToGetInvolved && <GetInvolved group={group} />}
      </div>
    </div>
  );
}
