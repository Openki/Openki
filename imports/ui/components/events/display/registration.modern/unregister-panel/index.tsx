import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "../../../../../../api/groups/publications";

import { Button, ButtonCancel } from "../../../../Buttons";

function ButtonUnregister(props: { onClick: () => void | Promise<void> }) {
  const { t } = useTranslation();

  return (
    <Button
      id="event-details-unregister-withdraw"
      block
      size="large"
      className="btn-danger"
      onClick={props.onClick}
      busyText={t("_button.unregistering", "Unregistering…")}
    >
      <strong>{t("event.details.unregister-withdraw", "Withdraw")}</strong>
    </Button>
  );
}

export interface Props {
  event: EventModel;
  onUnregister: () => Promise<void>;
}

export function UnregisterPanel({ event, onUnregister }: Props) {
  const { dateFormat } = useDateTimeFormat();

  const [isLoading, group] = useDetails(event.courseId || "-1");

  const { t } = useTranslation();
  const [unregisterDropdown, setUnregisterDropdown] = useState(false);

  function groupTitle() {
    if (event.courseId) {
      return group?.name;
    }
    return undefined;
  }

  return (
    <>
      {!unregisterDropdown ? (
        <>
          {t("event.details.registrationIsBinding", "Your registration is binding.")}
          <br />
          <Button
            id="event-detail-unregister-panel-withdraw"
            className="btn-add"
            onClick={() => {
              setUnregisterDropdown(true);
            }}
          >
            {t("event.details.withdraw-registration", "Withdraw my registration")}
          </Button>
        </>
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
          {!isLoading() && !!groupTitle() && (
            <p className="pt-3 mb-0">
              {t(
                "event.details.youStayEnrolled",
                "Note that you will stay enrolled as interested for {COURSETITLE}.",
                { COURSETITLE: groupTitle() },
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
}
