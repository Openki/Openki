import React from "react";
import { useTranslation } from "react-i18next";

import "./styles.scss";

export interface Props {
  onRemove: () => void;
}

export function RemoveDropdown({ onRemove }: Props) {
  const { t } = useTranslation();

  return (
    <span className="dropdown">
      <button
        type="button"
        className="discussion-delete-btn"
        aria-expanded="false"
        data-bs-toggle="dropdown"
      >
        <span className="fa-solid fa-trash" aria-hidden="true"></span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end dialog-dropdown">
        <li className="dropdown-header">
          {t("comment.delete.header", "Delete comment")}
          <button type="button" className="btn-close btn-close-white"></button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li className="dialog-dropdown-text">
          {t("comment.delete.confirm", "Delete this comment?")}
        </li>
        <li className="dialog-dropdown-btn">
          <button
            type="button"
            className="btn btn-remove discussion-delete-comment"
            onClick={() => {
              onRemove();
            }}
          >
            {t("course.discussion.deleteCommentButton", "Delete")}
          </button>
        </li>
      </ul>
    </span>
  );
}
