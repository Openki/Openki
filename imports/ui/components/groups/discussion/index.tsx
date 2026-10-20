import React from "react";
import { useTranslation } from "react-i18next";

import { useDetails } from "/imports/api/groups/publications";
import { type GroupModel } from "/imports/api/groups/groups";
import { type UserModel } from "/imports/api/users/users";
import { predefinedRole, SystemRoles } from "/imports/api/groups/lib/Role";

import { GeneralGroupDiscussion } from "/imports/ui/components/groups/discussion/general-group-discussion";
import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { useRegionRoles } from "/imports/ui/hooks/useRegionRoles";
import { useRoleDisplay } from "/imports/utils/getRoleDisplay";
import { GroupRoleChat } from "./group-role-chat";

import { cx } from "/imports/utils/cx";

import "./styles.scss";

export interface Props {
  select: string | undefined;
  groupId: string;
  eventId?: string | undefined;
}

function canUserAccessRoleChats({ group, user }: { group: GroupModel; user: UserModel | null }) {
  // TODO: Remove before merge
  // if (user) {
  //   const currentUserRoles = group.members.find((member) => member.user === user._id)?.roles;
  //   console.dir({
  //     group,
  //     groupRoles: group.roles,
  //     currentUserRoles,
  //   });
  // }

  // TODO: Extend with other group roles that have the role chat enabled
  return group && group.userHasRole(user?._id, SystemRoles.Team);
}

export function Discussion({ select, groupId, eventId }: Props) {
  const [isLoading, group] = useDetails(groupId);
  const user = useUser();
  const { t } = useTranslation();

  if (isLoading() || !group) {
    return null;
  }

  return (
    <div className="page-component discussion mt-4 mb-5">
      <div className="page-component-header">
        <h4>{t("group.title.Discussion", "Discussion")}</h4>
      </div>

      {canUserAccessRoleChats({ group, user }) ? (
        <DiscussionWithGroupChatTabs select={select} group={group} eventId={eventId} />
      ) : (
        <GeneralGroupDiscussion select={select} groupId={groupId} eventId={eventId} />
      )}
    </div>
  );
}

/**
 * This component only exists so we only load data for the role chats for users with access.
 */
function DiscussionWithGroupChatTabs({
  select,
  group,
  eventId,
}: Omit<Props, "groupId"> & { group: GroupModel }) {
  const [isLoading, regionRoles] = useRegionRoles(group.region);
  const { roleShort } = useRoleDisplay(regionRoles);

  const teamRole = regionRoles.find((role) => role.id === SystemRoles.Team.id);

  if (isLoading() || !teamRole) {
    return null;
  }

  const tabs: { id: string; title: string }[] = [
    // NOTE: To support direct links to the discussions section and to specific comments,
    // the GeneralGroupDiscussion section must right now be the first tab so it renders by default.
    // Otherwise the event listeners don't work as expected.
    { id: "discussions", title: "General" },
    {
      id: SystemRoles.Team.id,
      title: roleShort(predefinedRole(teamRole.id)),
    },
  ] as const;

  // TODO: Temporary to simplify development
  const TODO_activeIndex = 1;

  return (
    <>
      <nav className="mt-2 group-role-chat-tabs">
        <div className="nav nav-tabs" role="tablist">
          {tabs.map(({ id, title }, i) => {
            const tabId = `tab-${id}`;
            const tabContentId = `tab-${id}-content`;
            return (
              <button
                key={id}
                className={cx("nav-link border-bottom-0", i === TODO_activeIndex && "active")}
                id={tabId}
                data-bs-toggle="tab"
                data-bs-target={`#${tabContentId}`}
                type="button"
                role="tab"
                aria-controls={tabContentId}
                aria-selected={i === TODO_activeIndex}
              >
                {title}
              </button>
            );
          })}
        </div>
      </nav>
      <div className="tab-content border-0">
        {tabs.map(({ id }, i) => {
          const tabId = `tab-${id}`;
          const tabContentId = `tab-${id}-content`;
          return (
            <div
              key={id}
              className={cx("tab-pane max-h-none", i === TODO_activeIndex && "show active")}
              id={tabContentId}
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
            >
              {id === "discussions" ? (
                <GeneralGroupDiscussion select={select} groupId={group._id} eventId={eventId} />
              ) : (
                <GroupRoleChat roleId={id} group={group} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
