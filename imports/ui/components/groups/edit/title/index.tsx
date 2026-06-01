import { debounce } from "lodash-es";
import { Router } from "meteor/iron:router";
import React, { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFindFilter } from "/imports/api/groups/publications";
import { useCurrentRegionId } from "/imports/utils/useCurrentRegion";

import { FormControl } from "/imports/ui/components/form-control";

import "./styles.scss";

function Groups({ search }: { search: string }) {
  const { t } = useTranslation();
  const region = useCurrentRegionId();

  const [collapsed, setCollapsed] = useState(false);

  const [isLoading, groups] = useFindFilter({ search, region: region || "all" }, 20, undefined, [
    ["name", "asc"],
  ]);

  return !isLoading() && groups.length ? (
    <div className="list-group proposed-groups mt-3">
      <span className="list-group-item  border-0 border-bottom">
        <h5 className="m-0">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            {collapsed ? (
              <i className="fa-solid fa-angle-down fa-fw" />
            ) : (
              <i className="fa-solid fa-angle-up fa-fw" />
            )}
          </button>
          {t(
            "proposedGroupsDropdown.joinExistingGroupQuestion",
            "Maybe you would like to join an existing group?",
          )}
        </h5>
      </span>
      {!collapsed && (
        <>
          {groups.map((group) => (
            <a
              className="list-group-item list-group-item-action border-0"
              key={group._id}
              href={Router.path("showGroup", group)}
            >
              {group.name}
            </a>
          ))}
          <span className="list-group-item text-center border-0 border-top">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => {
                setCollapsed(true);
              }}
            >
              {t("button.proposedGroups.close", "No thanks")}
            </button>
          </span>
        </>
      )}
    </div>
  ) : null;
}

export function Title(props: {
  value?: string | undefined;
  showOtherProposals?: boolean | undefined;
  onChange: (newValue: string) => void;
  onBlur?: (() => void) | undefined;
  error?: ReactNode;
}) {
  const { t } = useTranslation();

  const [proposedSearch, setProposedSearch] = useState(props?.value || "");
  const [value, setValue] = useState(props?.value || "");

  useEffect(() => {
    setProposedSearch(props?.value || "");
    setValue(props?.value || "");
  }, [props.value]);

  return (
    <div className="mb-3">
      <FormControl
        id="group-edit-title"
        type="text"
        size="large"
        label={t("group.edit.title", "Title")}
        placeholder={t("group.title.placeholder", "What are you interested in?")}
        value={value}
        autoComplete="off"
        onChange={(value) => {
          setValue(value);
          props.onChange(value);
          debounce((value: string) => {
            setProposedSearch(value);
          }, 220)(value);
        }}
        onBlur={props.onBlur}
        error={props.error}
      />
      {props.showOtherProposals && proposedSearch.length > 3 && <Groups search={proposedSearch} />}
    </div>
  );
}
