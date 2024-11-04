import { Router } from "meteor/iron:router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export function CompactPropose() {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");

  return (
    <div className="row mx-0 align-items-start course-compact is-proposal">
      <div className="course-compact-content ps-2 pe-2">
        <div className="course-compact-title mb-0">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              Router.go("proposeCourse", undefined, { query: { title } });
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
    </div>
  );
}
