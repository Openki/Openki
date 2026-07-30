import { Router } from "meteor/iron:router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganizationTag } from "../organizations/tag";

export interface Props {
  organization?: string | undefined;
  organizationTagEvents?:
    | ((organizationId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
}

export function CompactPropose({ organization, organizationTagEvents }: Props) {
  const { t } = useTranslation();
  const elementRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");

  function organizationTagAttr(organizationId: string) {
    return {
      organizationId,
      onClick: async () => {
        await organizationTagEvents?.(organizationId).onClick();
      },
      onMouseOver: async () => {
        elementRef.current?.classList.add("elevate-child");
        await organizationTagEvents?.(organizationId).onMouseOver();
      },
      onMouseOut: async () => {
        elementRef.current?.classList.remove("elevate-child");
        await organizationTagEvents?.(organizationId).onMouseOut();
      },
    };
  }

  return (
    <div
      className={`row mx-0 align-items-start group-compact is-proposal${
        organization ? ` organization-${organization}` : ""
      }`}
      ref={elementRef}
    >
      <div className="group-compact-content ps-2 pe-2">
        <div className="group-compact-title my-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              Router.go("proposeGroup", undefined, {
                query: organization ? { title, organization } : { title },
              });
            }}
          >
            <div className="input-group input-group-lg p-2">
              <input
                type="text"
                className="form-control"
                placeholder={t("group.compact.propose.titlePlaceholder", "My proposal")}
                onChange={(event) => {
                  setTitle(event.currentTarget.value);
                }}
              />
              <button className="btn btn-success" type="submit">
                {t("group.compact.propose.button", "Go!")}
              </button>
            </div>
          </form>
        </div>
        <div className="ps-2 pe-2">
          {t(
            "group.compact.propose.description",
            "Start your own group, whether as a mentor or participant. You decide what you want to learn.",
          )}
        </div>
      </div>
      {!!organization && (
        <div className="tag-group group-organizations">
          {<OrganizationTag {...organizationTagAttr(organization)} />}
        </div>
      )}
    </div>
  );
}
