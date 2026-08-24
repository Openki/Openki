import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDetails as useGroupsDetails } from "/imports/api/groups/publications";
import { useSiteName } from "/imports/utils/getSiteName";

export function AlertMessage({
  isFrame,
  savedGroupId,
  onClose,
}: {
  isFrame?: boolean | undefined;
  savedGroupId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const siteName = useSiteName();
  const [savedGroupIsLoading, savedGroup] = useGroupsDetails(savedGroupId);

  function savedGroupLink() {
    if (isFrame) {
      const group = savedGroup;
      if (group) {
        return Router.url("showGroup", group);
      }
    }
    return "";
  }
  function savedGroupName() {
    if (isFrame) {
      const group = savedGroup;
      if (group) {
        return group.name;
      }
    }
    return false;
  }

  if (savedGroupIsLoading()) {
    return null;
  }

  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      <h4>
        <i className="fa-solid fa-check" />{" "}
        {t("group.edit.savedMessage", "Your proposal has been saved!")}
      </h4>
      <span className="whitespace-pre-line">
        {t("group.edit.linkToGroup", "You can see your new proposal {NAME} on {SITENAME}", {
          NAME: (
            <a className="alert-link" href={savedGroupLink()} target="_blank" rel="noreferrer">
              {savedGroupName()}
            </a>
          ),
          SITENAME: siteName,
        })}
      </span>
      <button
        type="button"
        className="btn-close btn-close-black"
        data-bs-dismiss="alert"
        aria-label={t("_button.close")}
        onClick={onClose}
      />
    </div>
  );
}
