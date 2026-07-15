import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";
import { cx } from "/imports/utils/cx";

import { GroupModel } from "/imports/api/groups/groups";

import { Description } from "../description";
import { History } from "../../../components/groups/history";
import { Files } from "../../../components/groups/Files";
import { PricePolicy } from "/imports/ui/components/price-policy";
import { CustomFieldDisplay } from "../../../components/groups/CustomFieldDisplay";

import "./styles.scss";

export function Submenu({ group }: { group: GroupModel }) {
  const { t } = useTranslation();
  const user = useUser();
  const [descriptionTruncated, setDescriptionTruncated] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);

  function canEdit() {
    return group.editableBy(user);
  }

  useEffect(() => {
    // function to check if the description is longer than the div that displays it
    if (elementRef.current) {
      setDescriptionTruncated(elementRef.current.scrollHeight > elementRef.current.clientHeight);
    }
  }, []);

  return (
    <>
      <nav className="group-details-nav">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="description-tab"
              data-bs-toggle="tab"
              data-bs-target="#description"
              type="button"
              role="tab"
              aria-controls="description"
              aria-selected="true"
            >
              <i className="fa-solid fa-file-lines fa-fw" />{" "}
              <span className="tab-label">{t("group.subnav.descr", "Description")}</span>
            </button>
          </li>
          {canEdit() && (
            <li className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="files-tab"
                data-bs-toggle="tab"
                data-bs-target="#files"
                type="button"
                role="tab"
                aria-controls="files"
                aria-selected="false"
              >
                <i className="fa-solid fa-file fa-fw" />{" "}
                <span className="tab-label">{t("group.subnav.files", "Files")}</span>
              </button>
            </li>
          )}
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="history-tab"
              data-bs-toggle="tab"
              data-bs-target="#history"
              type="button"
              role="tab"
              aria-controls="history"
              aria-selected="false"
            >
              <i className="fa-solid fa-clock-rotate-left fa-fw" />{" "}
              <span className="tab-label">{t("group.subnav.history", "History")}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="tab-content group-details-content">
        <div
          className={cx(
            "tab-pane active",
            !descriptionTruncated ? "max-h-none overflow-visible" : "overflow-hidden",
          )}
          id="description"
          role="tabpanel"
          aria-labelledby="description-tab"
          tabIndex={0}
        >
          <div className="group-description-fade-wrap">
            <div
              className={cx(
                "group-description",
                !descriptionTruncated ? "max-h-none overflow-visible" : "overflow-hidden",
              )}
              ref={elementRef}
            >
              <Description
                group={group}
                onStartEditing={() => {
                  // sets the state when the user starts editing
                  setDescriptionTruncated(false);
                }}
              />
              <CustomFieldDisplay groupId={group._id} />
            </div>
            {descriptionTruncated && <div className="group-description-fade-bottom"></div>}
          </div>
          {descriptionTruncated && (
            <div
              role="button"
              className="link-primary text-center"
              onClick={() => {
                setDescriptionTruncated(false);
              }}
            >
              — {t("groupDetails.showMore", "show more")} —
            </div>
          )}
        </div>
        <div
          className="tab-pane group-history"
          id="history"
          role="tabpanel"
          aria-labelledby="history-tab"
          tabIndex={0}
        >
          <History group={group} />
        </div>
        {canEdit() && (
          <div
            className="tab-pane max-h-none"
            id="files"
            role="tabpanel"
            aria-labelledby="files-tab"
            tabIndex={0}
          >
            <Files group={group} />
          </div>
        )}
        {!group.isPrivate() && <PricePolicy dismissible wrap="group-details-price-policy" />}
      </div>
    </>
  );
}
