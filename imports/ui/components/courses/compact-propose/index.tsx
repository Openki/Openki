import { Router } from "meteor/iron:router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GroupTag } from "../../groups/tag";

export type Props = {
  group?: string | undefined;
  groupTagEvents?:
    | ((groupId: string) => {
        onMouseOver: () => Promise<void>;
        onMouseOut: () => Promise<void>;
        onClick: () => Promise<void>;
      })
    | undefined;
};

export function CompactPropose({ group, groupTagEvents }: Props) {
  const { t } = useTranslation();
  const elementRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");

  function groupTagAttr(groupId: string) {
    return {
      groupId,
      onClick: async () => {
        await groupTagEvents?.(groupId).onClick();
      },
      onMouseOver: async () => {
        elementRef.current?.classList.add("elevate-child");
        await groupTagEvents?.(groupId).onMouseOver();
      },
      onMouseOut: async () => {
        elementRef.current?.classList.remove("elevate-child");
        await groupTagEvents?.(groupId).onMouseOut();
      },
    };
  }

  return (
    <div
      className={`row mx-0 align-items-start course-compact is-proposal${
        group ? ` group-${group}` : ""
      }`}
      ref={elementRef}
    >
      <div className="course-compact-content ps-2 pe-2">
        <div className="course-compact-title mb-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              Router.go("proposeCourse", undefined, {
                query: group ? { title, group } : { title },
              });
            }}
          >
            <div className="input-group input-group-lg p-2">
              <input
                type="text"
                className="form-control"
                placeholder={t("course.compact.propose.titlePlaceholder", "Your course")}
                onChange={(event) => {
                  setTitle(event.currentTarget.value);
                }}
              />
              <button className="btn btn-success" type="submit">
                {t("course.compact.propose.button", "Propose")}
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
      {group ? (
        <div className="tag-group course-groups">{<GroupTag {...groupTagAttr(group)} />}</div>
      ) : null}
    </div>
  );
}
