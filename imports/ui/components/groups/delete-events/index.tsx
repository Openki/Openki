import React from "react";
import { useTranslation } from "react-i18next";

import "./modal";

export function DeleteEvents(props: { onShowEventsDeleteModal: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <button
        className="btn btn-delete text-danger page-component-btn w-100"
        data-bs-title={t("group.event.edit.deleteEvents", "Delete events")}
        onClick={() => {
          props.onShowEventsDeleteModal();
        }}
      >
        <i className="fa-solid fa-trash-can" />
       </button>
    </div>
  );
}
