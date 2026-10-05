import React from "react";
import { useTranslation } from "react-i18next";

import { useDetails } from "/imports/api/groups/publications";
import { type GroupModel } from "/imports/api/groups/groups";
import { type UserModel } from "/imports/api/users/users";

import { GeneralGroupDiscussion } from "/imports/ui/components/groups/discussion/general-group-discussion";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { cx } from "/imports/utils/cx";

import "./styles.scss";

export interface Props {
  select: string | undefined;
  groupId: string;
  eventId?: string | undefined;
}

export function Discussion({ select, groupId, eventId }: Props) {
  const [isLoading, group] = useDetails(groupId);
  const user = useUser();
  const { t } = useTranslation();

  if (isLoading() || !group) {
    return null;
  }

  return (
    <div className="page-component discussion mt-4">
      <div className="page-component-header">
        <h4>{t("group.title.Discussion", "Discussion")}</h4>
      </div>

      {group && group.editableBy(user) ? (
        <DiscussionWithGroupChatTabs select={select} group={group} eventId={eventId} user={user} />
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
  user,
}: Omit<Props, "groupId"> & { group: GroupModel; user: UserModel | null }) {
  if (!group.editableBy(user)) {
    throw new Error("This should only be accessible by group admins");
  }

  const tabs: { id: string; title: string; Content: React.FC }[] = [
    // NOTE: To support direct links to the discussions section and to specific comments,
    // the GeneralGroupDiscussion section must right now be the first tab so it renders by default.
    // Otherwise the event listeners don't work as expected.
    {
      id: "discussions",
      title: "General",
      Content: () => (
        <GeneralGroupDiscussion select={select} groupId={group._id} eventId={eventId} />
      ),
    },
    {
      id: "team",
      title: "Team",
      Content: () => <div>Team chat</div>,
    },
  ];

  return (
    <>
      <nav className="mt-2">
        <div className="nav nav-tabs" role="tablist">
          {tabs.map(({ id, title }, i) => {
            const tabId = `tab-${id}`;
            const tabContentId = `tab-${id}-content`;
            return (
              <button
                key={id}
                className={cx("nav-link", i === 0 && "active")}
                id={tabId}
                data-bs-toggle="tab"
                data-bs-target={`#${tabContentId}`}
                type="button"
                role="tab"
                aria-controls={tabContentId}
                aria-selected={i === 0}
              >
                {title}
              </button>
            );
          })}
        </div>
      </nav>
      <div className="tab-content">
        {tabs.map(({ id, Content }, i) => {
          const tabId = `tab-${id}`;
          const tabContentId = `tab-${id}-content`;
          return (
            <div
              key={id}
              className={cx("tab-pane", i === 0 && "show active")}
              id={tabContentId}
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
            >
              <Content />
            </div>
          );
        })}
      </div>
    </>
  );
}
