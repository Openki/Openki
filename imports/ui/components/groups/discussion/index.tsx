import React from "react";
import { useTranslation } from "react-i18next";

import { useDetails } from "/imports/api/groups/publications";
import { type GroupRole, type GroupModel } from "/imports/api/groups/groups";
import { SystemRoles } from "/imports/api/groups/lib/Role";

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

function useAvailableRoleChats(group: GroupModel | undefined): GroupRole[] {
  const user = useUser();

  if (
    !group ||
    // Only available for signed in users
    !user ||
    // NOTE: Only enabled during development for now until the feature is ready for production.
    !Meteor.isDevelopment
  ) {
    return [];
  }

  const rolesWithChatEnabled: GroupRole[] = [SystemRoles.Team];

  const availableRoleChats = group.roles.filter((groupRole) =>
    rolesWithChatEnabled.some(
      (role) =>
        // The chat needs to be enabledfor the specific role
        groupRole.id === role.id &&
        // The user needs the specific role, unless they have the team role and should have access to all role chats.
        (group.userHasRole(user._id, role) || group.userHasRole(user._id, SystemRoles.Team)),
    ),
  );
  return availableRoleChats;
}

export function Discussion({ select, groupId, eventId }: Props) {
  const [isLoading, group] = useDetails(groupId);
  const { t } = useTranslation();
  const availableRoleChats = useAvailableRoleChats(group);

  if (isLoading() || !group) {
    return null;
  }

  return (
    <div className="page-component discussion mt-4 mb-5">
      <div className="page-component-header">
        <h4>{t("group.title.Discussion", "Discussion")}</h4>
      </div>

      {availableRoleChats.length ? (
        <DiscussionWithGroupChatTabs
          select={select}
          group={group}
          eventId={eventId}
          availableRoleChats={availableRoleChats}
        />
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
  availableRoleChats,
}: Omit<Props, "groupId"> & { group: GroupModel; availableRoleChats: GroupRole[] }) {
  const [isLoading, regionRoles] = useRegionRoles(group.region);
  const { roleShort } = useRoleDisplay(regionRoles);

  if (isLoading()) {
    return null;
  }

  const tabs: { id: string; title: string }[] = [
    // The general group discussions
    { id: "discussions", title: "Public" },
    // Role chat tabs
    ...availableRoleChats.map((role) => ({
      id: role.id,
      // TODO: Replace this with a formatted i18n string
      title: `${roleShort(role)} chat`,
    })),
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
