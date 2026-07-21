import React from "react";
import { useTranslation } from "react-i18next";

import { GroupModel } from "/imports/api/groups/groups";
import * as EventsPub from "/imports/api/events/publications";

import { LocalTime } from "/imports/utils/local-time";

import { Button, ButtonClose } from "../../components/Buttons";
import { ArchiveButton } from "./ArchiveButton";
import { Confirm, ConfirmActions, ConfirmText } from "/imports/ui/components/Confirm";

export function DeleteConfirmDialog({
  group,
  disabled,
  onArchive,
  onDelete,
  onClose,
}: {
  group: GroupModel;
  disabled?: boolean | undefined;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
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

  function getDeleteWarning() {
    if (future > 0 && past > 0) {
      return t(
        "group.reallyDelete.pastAndFutureEvents",
        "Please confirm that you would like to delete {GROUP} and all its {NUM_PAST} passed and {NUM_FUTURE} upcoming events.\n⚠️ This cannot be undone.",
        {
          GROUP: <span className="fw-bold">{group.name}</span>,
          NUM_PAST: past,
          NUM_FUTURE: future,
        },
      );
    }

    if (future > 0) {
      return t(
        "group.reallyDelete.futureEvents",
        "Please confirm that you would like to delete {GROUP} and its {NUM_FUTURE} upcoming events.\n⚠️ This cannot be undone.",
        {
          GROUP: <span className="fw-bold">{group.name}</span>,
          NUM_FUTURE: future,
        },
      );
    }

    if (past > 0) {
      return t(
        "group.reallyDelete.pastEvents",
        "Please confirm that you would like to delete {GROUP} and its {NUM_PAST} passed events.\n⚠️ This cannot be undone.",
        {
          GROUP: <span className="fw-bold">{group.name}</span>,
          NUM_PAST: past,
        },
      );
    }

    return t(
      "group.reallyDelete",
      "Please confirm that you would like to delete {GROUP}.\n⚠️ This cannot be undone.",
      {
        GROUP: <span className="fw-bold">{group.name}</span>,
      },
    );
  }

  function getDeleteLabel() {
    if (future > 0 || past > 0) {
      return t("group.delete.confirm.button", "Delete {GROUP} and its events", {
        GROUP: group.name,
      });
    }

    return t("group.delete.confirm.buttonZero", "Delete {GROUP}", {
      GROUP: group.name,
    });
  }

  return (
    <Confirm>
      <ConfirmText>{getDeleteWarning()}</ConfirmText>
      <ConfirmActions>
        {!group.archived && (
          <ArchiveButton className="btn-warning" disabled={disabled} onArchive={onArchive}>
            {t("group.delete.confirm.archiveButton", "Rather archive")}
          </ArchiveButton>
        )}
        <Button
          id="group-details-confirm-dialog-delete"
          className="btn-danger"
          disabled={disabled}
          needsLogin
          onClick={onDelete}
          busyText={t("_button.deleting")}
        >
          {getDeleteLabel()}
        </Button>
        <ButtonClose
          id="group-details-confirm-dialog-close"
          disabled={disabled}
          onClick={onClose}
        />
      </ConfirmActions>
    </Confirm>
  );
}
