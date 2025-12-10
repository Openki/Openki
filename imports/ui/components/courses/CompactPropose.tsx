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
      className={`row mx-0 align-items-start course-compact is-proposal${
        organization ? ` group-${organization}` : ""
      }`}
      ref={elementRef}
    >
      <div className="course-compact-content ps-2 pe-2">
        <div className="course-compact-title mb-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              Router.go("proposeCourse", undefined, {
                query: organization ? { title, group: organization } : { title },
              });
            }}
          >
            <div className="input-group input-group-lg p-2">
              <input
                type="text"
                className="form-control"
                placeholder={t("course.compact.propose.titlePlaceholder", "My proposal")}
                onChange={(event) => {
                  setTitle(event.currentTarget.value);
                }}
              />
              <button className="btn btn-success" type="submit">
                {t("course.compact.propose.button", "Go!")}
              </button>
            </div>
          </form>
        </div>
        <div className="ps-2 pe-2">
          {t(
            "course.compact.propose.description",
            "Start your own course, whether as a mentor or participant. You decide what you want to learn.",
          )}
        </div>
      </div>
      {!!organization && (
        <div className="tag-group course-groups">
          {<OrganizationTag {...organizationTagAttr(organization)} />}
        </div>
      )}
    </div>
  );
}
