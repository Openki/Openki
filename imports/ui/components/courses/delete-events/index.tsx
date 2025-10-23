import React from "react";
import { useTranslation } from "react-i18next";

import "./modal";

export function DeleteEvents(props: { onShowEventsDeleteModal: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="event-caption-wrap">
      <button
        className="btn p-0"
        title={t("course.event.edit.deleteEvents", "Delete events")}
        onClick={() => {
          props.onShowEventsDeleteModal();
        }}
      >
        <div className="event-caption event-caption-placeholder event-caption-action event-caption-delete">
          <div className="event-caption-header-wrap">
            <div className="event-caption-header">
              <div className="event-caption-pseudoborder"></div>
            </div>
          </div>
          <div className="event-caption-body-wrap">
            <div className="event-caption-body"></div>
          </div>
          <span className="event-caption-icon">
            <i className="fa-solid fa-trash-can fa-2x"></i>
          </span>
        </div>
      </button>
    </div>
  );
}
