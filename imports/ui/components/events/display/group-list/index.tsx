import React from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/events/publications";
import { useDetails as useRegionDetails } from "/imports/api/regions/publications";

import { GroupTag } from "/imports/ui/components/groups/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";
import { RemoveOrganizer } from "./RemoveOrganizer";
import { MakeOrganizer } from "./MakeOrganizer";

export interface Props { event: EventModel }

export function GroupList({ event: event2 }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  // for blaze, can be removed after migration
  // subscribe in react to keep reactivity
  const [isLoading, event] = useDetails(event2._id);

  const [isRegionLoading, region] = useRegionDetails(event2?.region);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function tools(groupId: string, event: EventModel) {
    // Groups may be adopted from the course, these cannot be removed
    const ownGroup = event.groups.includes(groupId);

    return (
      <>
        {ownGroup && (!!user?.mayPromoteWith(groupId) || event.editableBy(user)) && (
          <li className="dialog-dropdown-btn">
            <Remove event={event} groupId={groupId} />
          </li>
        )}
        {ownGroup && event.editableBy(user) && (
          <li className="dialog-dropdown-btn">
            {event.groupOrganizers.includes(groupId) ? (
              <RemoveOrganizer event={event} groupId={groupId} />
            ) : (
              <MakeOrganizer event={event} groupId={groupId} />
            )}
          </li>
        )}
      </>
    );
  }

  if (isLoading() || !event || isRegionLoading()) return null;

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

  return (
    <div className="tag-group multiline">
      {groups?.map((groupId) => {
        const isOrganizer = event.editors.includes(groupId);
        // Groups may be adopted from the course, these cannot be removed
        const ownGroup = event.groups.includes(groupId);
        return (
          <React.Fragment key={groupId}>
            <GroupTag groupId={groupId} isOrganizer={isOrganizer} />
            {isOrganizer && (
              <div className="tag group-tag addon">
                <span
                  className="fa-solid fa-bullhorn fa-fw"
                  aria-hidden="true"
                  title={t("grouplist.organizer.title", {
                    COURSE: event.title,
                  })}
                ></span>
              </div>
            )}

            {ownGroup && (!!user?.mayPromoteWith(groupId) || event.editableBy(user)) && (
              <div className="btn-group tag-btn group-tag-btn addon align-top">
                <button
                  type="button"
                  className="dropdown-toggle"
                  aria-expanded="false"
                  aria-haspopup="true"
                  data-bs-toggle="dropdown"
                ></button>
                <ul className="dropdown-menu dialog-dropdown">
                  <li className="dropdown-header">
                    {t("grouplist.editgroup.header", "Edit group")}
                    <button type="button" className="btn-close btn-close-white"></button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {tools(groupId, event)}
                </ul>
              </div>
            )}
          </React.Fragment>
        );
      })}

      <Add event={event} />
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EventGroupList", () => GroupList);
