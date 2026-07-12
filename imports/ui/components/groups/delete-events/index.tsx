import React from "react";
import { useTranslation } from "react-i18next";

import "./modal";
import "./styles.scss";

export function DeleteEvents(props: { onShowEventsDeleteModal: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <button
        className="btn btn-sm bin-button-container"
        data-bs-title={t("group.event.edit.deleteEvents", "Delete events")}
        onClick={() => {
          props.onShowEventsDeleteModal();
        }}
      >
        <i className="fa-solid fa-trash-can delete-icon" />
      </button>
    </div>
  );
}
