import React from "react";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { cx } from "/imports/utils/cx";

import { GroupCompact } from "./compact";
import { CompactPropose } from "./CompactPropose";
import { GroupModel } from "/imports/api/groups/groups";

export interface Props {
  groups: GroupModel[];
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
  small?: boolean;
  containsPropose?: boolean | undefined;
  /** that should be added on propose a new group */
  organization?: string | undefined;
}

export function GroupList({
  groups,
  organizationTagEvents,
  categoryTagEvents,
  small,
  containsPropose,
  organization,
}: Props) {
  return (
    <div
      className={cx("row g-2 row-cols-1 row-cols-sm-2 row-cols-lg-3", !small && "row-cols-xl-4")}
    >
      {groups.map((group, index) => (
        <React.Fragment key={group._id}>
          {/* The seventh box should always be the propose one, after then every 11 */}
          {PublicSettings.feature.proposeGroupBox &&
            !!containsPropose &&
            (index - 6) % 10 === 0 && (
              <div className="col">
                <CompactPropose
                  organization={organization}
                  organizationTagEvents={organizationTagEvents}
                />
              </div>
            )}
          <div className="col">
            <GroupCompact
              group={group}
              organizationTagEvents={organizationTagEvents}
              categoryTagEvents={categoryTagEvents}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
