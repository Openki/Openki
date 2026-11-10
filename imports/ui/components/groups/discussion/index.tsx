import React, { useState } from "react";
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
import { isSameRole } from "/imports/api/groups/lib/isRole";

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
    !user
  ) {
    return [];
  }

  const rolesWithChatEnabled: GroupRole[] = [SystemRoles.Team];

  const availableRoleChats = group.roles.filter((groupRole) =>
    rolesWithChatEnabled.some(
      (role) =>
        // The chat needs to be enabledfor the specific role
        isSameRole(groupRole, role) &&
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
  const { t } = useTranslation();
  const [hasScrolled, setHasScrolled] = useState(false);

  if (isLoading()) {
    return null;
  }

  const tabs: { id: string; title: string }[] = [
    // The general group discussions
    { id: "discussions", title: t("group.discussion.tabTitle", "Public") },
    // Role chat tabs
    ...availableRoleChats.map((role) => ({
      id: role.id,
      title: t("group.roleChats.tabTitle", "{ROLE} chat", { ROLE: roleShort(role) }),
    })),
  ] as const;

  return (
    <>
      <nav className="mt-2 group-role-chat-tabs">
        <div className="nav nav-tabs" role="tablist">
          {tabs.map(({ id, title }, i) => {
            const tabId = `tab-${id}`;
            const tabContentId = `tab-${id}-content`;
            const isChatTab = id !== "discussions";
            return (
              <button
                key={id}
                className={cx("nav-link border-bottom-0", i === 0 && "active")}
                id={tabId}
                data-bs-toggle="tab"
                data-bs-target={`#${tabContentId}`}
                role="tab"
                aria-controls={tabContentId}
                aria-selected={i === 0}
                onClick={
                  // NOTE: This is a quick and dirty solution and should ideally be solved in the
                  // GroupRoleChat component instead. That wasn't straightforward though.
                  isChatTab && !hasScrolled
                    ? () => {
                        // Scroll to bottom to show the most recent group chat message.
                        // This only happens the first time the tab is opened,
                        // so the user's scroll position is preserved if they close the chat tab
                        // and then come back to it later.
                        const container = document.querySelector(".group-chat-tab .chat-messages");
                        if (!container) {
                          throw new Error("Failed to find group chat messages container");
                        }

                        // Only proceed if the messages have been loaded and rendered
                        if (container.children.length) {
                          // Scroll to the bottom only when first the messages
                          container.scrollTop = container.scrollHeight;
                          setHasScrolled(true);
                        }
                      }
                    : undefined
                }
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
          const isChatTab = id !== "discussions";
          return (
            <div
              key={id}
              className={cx(
                "tab-pane max-h-none",
                i === 0 && "show active",
                isChatTab && "group-chat-tab",
              )}
              id={tabContentId}
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
            >
              {isChatTab ? (
                <GroupRoleChat roleId={id} group={group} />
              ) : (
                <GeneralGroupDiscussion select={select} groupId={group._id} eventId={eventId} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
