import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/courses/publications";

import { ButtonCancel } from "/imports/ui/components/buttons";

function ButtonUnregister(props: {
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  busy?: boolean | undefined;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="btn btn-danger btn-event text-center"
      onClick={props.onClick}
      disabled={props.busy}
    >
      {props.busy ? (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
          {t("_button.unregistering", "Unregistering…")}
        </>
      ) : (
        t("event.details.unregister-withdraw", "Withdraw")
      )}
    </button>
  );
}

export interface Props {
  event: EventModel;
  busy: boolean;
  onUnregister: () => Promise<void>;
}

export function UnregisterPanel({ event, busy, onUnregister }: Props) {
  const { dateFormat } = useDateTimeFormat();

  const [isLoading, course] = useDetails(event.courseId || "-1");

  const { t } = useTranslation();
  const [unregisterDropdown, setUnregisterDropdown] = useState(false);

  function courseTitle() {
    if (event.courseId) {
      return course?.name;
    }
    return undefined;
  }

  return (
    <>
      {!unregisterDropdown ? (
        <button
          type="button"
          className="btn btn-add mt-4"
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
                onClick={() => {
                  setUnregisterDropdown(false);
                }}
              />
            </div>
            <div className="col-lg-7 d-grid">
              <ButtonUnregister
                onClick={async () => {
                  setUnregisterDropdown(false);
                  await onUnregister();
                }}
                busy={busy}
              />
            </div>
          </div>
          {!isLoading() && !!courseTitle() && (
            <p className="pt-3 mb-0">
              {t(
                "event.details.youStayEnrolled",
                "Note that you will stay enrolled as interested for {COURSETITLE}.",
                { COURSETITLE: courseTitle() },
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
}
