import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/groups/publications";

import { Button, ButtonCancel } from "../../../../Buttons";

function ButtonUnregister(props: { onClick: () => void | Promise<void> }) {
  const { t } = useTranslation();

  return (
    <Button
      id="event-details-unregister-withdraw"
      block
      className="btn-danger fw-bold"
      size="large"
      onClick={props.onClick}
      needsLogin
      busyText={t("_button.unregistering", "Unregistering…")}
    >
      {t("event.details.unregister-withdraw", "Withdraw")}
    </Button>
  );
}

export interface Props {
  event: EventModel;
  onUnregister: () => Promise<void>;
}

export function UnregisterPanel({ event, onUnregister }: Props) {
  const { dateFormat } = useDateTimeFormat();

  const [isLoading, group] = useDetails(event.groupId || "-1");

  const { t } = useTranslation();
  const [unregisterDropdown, setUnregisterDropdown] = useState(false);

  function getGroupName() {
    return event.groupId && group?.name;
  }

  return (
    <>
      {!unregisterDropdown ? (
        <button
          type="button"
          className="btn btn-add btn-lg"
          onClick={() => {
            setUnregisterDropdown(true);
          }}
        >
          {t("event.details.withdraw-registration", "Withdraw my registration")}
        </button>
      ) : (
        <div className="p-3 event-detail-register-dropdown">
          <p>
            {t(
              "event.details.want-to-withdraw",
              'Do you want to withdraw your registration for the event "{EVENTTITLE}" on the {DATE}?',
              { EVENTTITLE: event.title, DATE: dateFormat(event.startLocal) },
            )}
          </p>
          <div className="row justify-content-between align-items-center gap-3">
            <div className="col-lg-4 d-grid">
              <ButtonCancel
                id="unregister-panel-cancel"
                onClick={() => setUnregisterDropdown(false)}
              />
            </div>
            <div className="col-lg-7 d-grid">
              <ButtonUnregister
                onClick={async () => {
                  setUnregisterDropdown(false);
                  await onUnregister();
                }}
              />
            </div>
          </div>
          {!isLoading() && !!getGroupName() && (
            <p className="pt-3 mb-0">
              {t(
                "event.details.youStayEnrolled",
                "Note that you will stay enrolled as interested for {GROUP}.",
                { GROUP: getGroupName() },
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
}
