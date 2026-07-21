import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";
import * as EventsPub from "/imports/api/events/publications";

import { LocalTime } from "/imports/utils/local-time";

import { Button, ButtonCancel } from "../../../components/Buttons";
import { ButtonGroupArchive } from "../button-group-archive";

import "./styles.scss";

export function ConfirmDialog({
  group,
  disabled,
  archiveButton,
  onArchive,
  onDelete,
  onCancel,
}: {
  group: GroupModel;
  disabled?: boolean | undefined;
  archiveButton?: boolean | undefined;
  onArchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  // load all events for this group to count past and future
  const now = LocalTime.now();
  const [isLoading, events] = EventsPub.useForGroup(group._id);
  const past = isLoading()
    ? 0
    : events.filter((e) => LocalTime.fromString(e.startLocal) < now).length;
  const future = isLoading()
    ? 0
    : events.filter((e) => LocalTime.fromString(e.startLocal) >= now).length;

  function getDeleteLabel() {
    if (future > 0 && past > 0) {
      return t(
        "group.delete.confirm.buttonBothPastAndFutureEvents",
        "Delete {GROUP} and all its {NUM_PAST} passed and {NUM_FUTURE} upcoming events",
        { GROUP: group.name, NUM_PAST: past, NUM_FUTURE: future },
      );
    }

    if (future > 0) {
      return t(
        "group.delete.confirm.buttonFuture",
        "Delete {GROUP} and its {NUM_FUTURE} upcoming events",
        { GROUP: group.name, NUM_FUTURE: future },
      );
    }

    if (past > 0) {
      return t(
        "group.delete.confirm.buttonPast",
        "Delete {GROUP} and its {NUM_PAST} passed events",
        {
          GROUP: group.name,
          NUM_PAST: past,
        },
      );
    }

    return t("group.delete.confirm.buttonZero", "Delete {GROUP}", {
      GROUP: group.name,
    });
  }

  return (
    <div className="group-delete-confirm">
      <p>
        {t(
          "group.reallydelete",
          "Please confirm that you would like to delete {GROUP}. This cannot be undone.",
          { GROUP: group.name },
        )}
      </p>
      <div className="form-actions">
        {!!archiveButton && (
          <ButtonGroupArchive
            className="btn-warning"
            disabled={disabled}
            onArchive={async () => onArchive()}
          >
            {t("group.delete.confirm.archiveButton", "Rather archive")}
          </ButtonGroupArchive>
        )}

        <Button
          id="group-details-confirm-dialog-delete"
          className="btn-danger"
          disabled={disabled}
          needsLogin
          onClick={async () => onDelete()}
          busyText={t("_button.deleting")}
        >
          {getDeleteLabel()}
        </Button>
        <ButtonCancel
          id="group-details-confirm-dialog-cancel"
          disabled={disabled}
          onClick={onCancel}
        />
      </div>
    </div>
  );
}
