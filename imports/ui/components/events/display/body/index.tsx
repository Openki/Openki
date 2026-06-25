import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import { useUser } from "/imports/utils/react-meteor-data";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Regions } from "/imports/api/regions/regions";
import { useDetails } from "/imports/api/groups/publications";

import * as Analytics from "/imports/ui/lib/analytics";

import { Props as DeleteConfirmDialogProps } from "./delete-confirm-dialog";
import { CancelConfirmDialog, Props as CancelConfirmDialogProps } from "./cancel-confirm-dialog";
import { EventReplication, Props as EventReplicationProps } from "../../replication";
import { Content } from "../content";
import { Files } from "../../../groups/Files";
import { DeleteConfirmDialog } from "../../../delete-confirm-dialog";
import { Button, ButtonDelete, ButtonEdit } from "../../../Buttons";

import "./styles.scss";

function GroupEvent({ event, groupId }: { event: EventModel; groupId: string }) {
  const { t } = useTranslation();

  const [isLoading, group] = useDetails(groupId);

  function singleEvent() {
    return group?.singleEvent;
  }

  if (isLoading()) {
    return null;
  }

  return singleEvent() ? (
    <>
      <nav>
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="description-tab"
              data-bs-toggle="tab"
              data-bs-target="#description"
              type="button"
              role="tab"
              aria-controls="description"
              aria-selected="true"
            >
              <i className="fa-solid fa-file-lines fa-fw" />
              <span className="tab-label">{t("group.subnav.descr", "Description")}</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="files-tab"
              data-bs-toggle="tab"
              data-bs-target="#files"
              type="button"
              role="tab"
              aria-controls="files"
              aria-selected="false"
            >
              <i className="fa-solid fa-file fa-fw" />
              <span className="tab-label">{t("group.subnav.files", "Files")}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="tab-content border-none">
        <div
          className="tab-pane max-h-none overflow-visible active"
          id="description"
          role="tabpanel"
          aria-labelledby="description-tab"
          tabIndex={0}
        >
          <Content event={event} />
        </div>
        {!!group && (
          <div
            className="tab-pane max-h-none"
            id="files"
            role="tabpanel"
            aria-labelledby="files-tab"
            tabIndex={0}
          >
            <div className="p-3">
              <Files group={group} />
            </div>
          </div>
        )}
      </div>
    </>
  ) : (
    <Content event={event} />
  );
}

export function Display({
  event,
  onRemove,
  onEdit,
}: {
  event: EventModel;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const user = useUser();

  const [replicating, setReplicating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function isExpanded() {
    return canceling || expanded;
  }
  function cancelConfirmDialogAttr(): CancelConfirmDialogProps {
    return {
      event,
      onCancel: async (reason) => {
        try {
          await EventsMethods.cancel(event._id, reason);

          setCanceling(false);
          Alert.success(
            t("event.details.message.eventHasBeenCanceled", "{EVENT} was canceled.", {
              EVENT: event.title,
            }),
          );
        } catch (err) {
          Alert.serverError(
            err,
            t("event.details.message.eventHasBeenCanceled.error", "Cancelling went wrong"),
          );
        }
      },
      onClose: () => {
        setCanceling(false);
      },
    };
  }
  function deleteConfirmDialogAttr(): DeleteConfirmDialogProps {
    return {
      confirmText: t(
        "event.realydelete",
        "Please confirm that you would like to delete this event. This cannot be undone, the event will be permanently deleted and not visible any more. If the event is allready shared or published somewhere we strongly recomend to instead only canceling it.",
      ),
      confirmButton: t("event.delete.confirm.button", "Delete event without notifying anyone"),
      cancelButton: t("event.delete.confirm.cancel.button", "Rather mark as canceled"),
      busyButton: t("event.delete.confirm.button.busy", "Deleting event…"),
      onRemove: async () => {
        const { title, region } = event;
        const group = event.groupId;

        onRemove();
        try {
          await EventsMethods.remove(event._id);

          Alert.success(
            t("eventDetails.eventRemoved", 'The "{TITLE}" event has been deleted.', {
              TITLE: title,
            }),
          );

          Analytics.trackEvent(
            "Event deletions",
            "Event deletions as team",
            Regions.findOne(region)?.nameEn,
          );

          if (group) {
            Router.go("showGroup", { _id: group });
          } else {
            Router.go("home");
          }
        } catch (err) {
          Alert.serverError(err, t("eventDetails.eventRemoved.error", "Could not remove event"));
        }
      },
      onCancel: async () => {
        setExpanded(false);
      },
    };
  }
  function eventReplicationAttr(): EventReplicationProps {
    return {
      event,
      afterSave: async () => {
        setReplicating(false);
        setExpanded(false);
      },
      onCancel: async () => {
        setReplicating(false);
        setExpanded(false);
      },
    };
  }

  function handleShowReplication() {
    setReplicating(true);
    setExpanded(false);
  }

  function handleDownload(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.stopPropagation();
    Analytics.trackEvent(
      "Events downloads",
      "Event downloads via event details",
      Regions.findOne(event.region)?.nameEn,
    );
  }

  function handleCancel() {
    setCanceling(true);
    setExpanded(false);
  }

  async function handleExpand() {
    setExpanded(true);
  }

  async function handleUncancel() {
    try {
      await EventsMethods.uncancel(event._id);
      Alert.success(
        t(
          "event.details.message.eventHasBeenUncanceled",
          "{EVENT} has been uncaneled. No notifications have been sent.",
          {
            EVENT: event.title,
          },
        ),
      );
    } catch (err) {
      Alert.serverError(
        err,
        t("event.details.message.eventHasBeenUncanceled.error", "Uncancelling went wrong"),
      );
    }
  }

  return (
    <div className="page-component">
      {event.editableBy(user) && event.groupId ? (
        <GroupEvent event={event} groupId={event.groupId} />
      ) : (
        <Content event={event} />
      )}
      {replicating ? (
        <EventReplication {...eventReplicationAttr()} />
      ) : (
        event.editableBy(user) && (
          <>
            <div className="actions">
              {!isExpanded() && (
                <>
                  <ButtonEdit id="events-display-body-edit" onClick={onEdit} />
                  <Button
                    id="events-display-body-repeat"
                    className="btn-edit"
                    onClick={handleShowReplication}
                  >
                    {t("event.details.repl_menu_btn", "Repeat")}
                  </Button>
                  <a
                    className="btn btn-edit"
                    href={Router.path("calEvent", event)}
                    title={t("event.detail.download_cal", "Download event to my calendar")}
                    onClick={handleDownload}
                  >
                    {t("event.details.download", "Download")}
                  </a>
                  {!event.canceled ? (
                    <Button
                      id="events-display-body-cancel"
                      className="btn-remove"
                      onClick={handleCancel}
                    >
                      {t("event.details.cancel", "Cancel this event")}
                    </Button>
                  ) : (
                    <Button
                      submit
                      id="events-display-body-uncancel"
                      className="btn-edit"
                      onClick={handleUncancel}
                    >
                      {t("event.details.uncancel", "Uncancel this event")}
                    </Button>
                  )}
                  <ButtonDelete id="events-display-confirmDelete" onClick={handleExpand} />
                </>
              )}
            </div>
            {expanded && <DeleteConfirmDialog {...deleteConfirmDialogAttr()} />}
            {canceling && <CancelConfirmDialog {...cancelConfirmDialogAttr()} />}
          </>
        )
      )}
    </div>
  );
}
