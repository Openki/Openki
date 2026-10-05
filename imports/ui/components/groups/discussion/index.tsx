import React from "react";
import { useTranslation } from "react-i18next";

import { GeneralGroupDiscussion } from "/imports/ui/components/groups/discussion/general-group-discussion";

import "./styles.scss";
import { cx } from "/imports/utils/cx";

export interface Props {
  select: string | undefined;
  groupId: string;
  eventId?: string | undefined;
}

export function Discussion({ select, groupId, eventId }: Props) {
  const { t } = useTranslation();

  const tabs: { id: string; title: string; Content: React.FC }[] = [
    {
      id: "discussions",
      title: "General",
      Content: () => <GeneralGroupDiscussion select={select} groupId={groupId} eventId={eventId} />,
    },
    {
      id: "team",
      title: "Team",
      Content: () => <div>Team chat</div>,
    },
  ];

  return (
    <div className="page-component discussion mt-4">
      <div className="page-component-header">
        <h4>{t("group.title.Discussion", "Discussion")}</h4>
      </div>

      <nav>
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
          const tabContentId = `tab-${id}-content`;
          return (
            <div
              key={id}
              className={cx("tab-pane", i === 0 && "show active")}
              id={tabContentId}
              role="tabpanel"
              aria-labelledby={tabContentId}
              tabIndex={0}
            >
              <Content />
            </div>
          );
        })}
      </div>
    </div>
  );
}
