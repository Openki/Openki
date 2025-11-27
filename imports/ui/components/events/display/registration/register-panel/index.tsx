import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";

import { PleaseLogin } from "/imports/ui/components/please-login";
import { ButtonCancel } from "../../../../Buttons";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { FormCheck } from "/imports/ui/components/FormCheck";

function ButtonRegister(props: {
  forTwo: boolean;
  onClick: () => Promise<void>;
  busy?: boolean | undefined;
}) {
  const { t } = useTranslation();

  return (
    <PleaseLogin
      id="events-display-registration"
      type="button"
      visitorUserAllowed
      className="btn btn-add btn-event text-center"
      onClick={props.onClick}
      disabled={props.busy}
    >
      {props.busy ? (
        <>
          <i className="fa-solid fa-circle-notch fa-spin fa-fw" />{" "}
          {t("_button.registering", "Registering…")}
        </>
      ) : !props.forTwo ? (
        t("event.details.register-register", "Register")
      ) : (
        t("event.details.register-registerForTwo", "Register for 2 seats")
      )}
    </PleaseLogin>
  );
}

export interface Props {
  event: EventModel;
  busy: boolean;
  onRegister: (companions: number) => Promise<void>;
}

export function RegisterPanel({ event, busy, onRegister }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const { dateFormat } = useDateTimeFormat();
  const [registerDropdown, setRegisterDropdown] = useState(false);
  const [registerWithCompanions, setRegisterWithCompanions] = useState(false);

  return (
    <>
      {!registerDropdown ? (
        <button
          type="button"
          className="btn btn-add btn-event"
          onClick={() => setRegisterDropdown(true)}
        >
          {t("event.details.reserve-a-seat", "Reserve a seat")}
        </button>
      ) : (
        <div className="p-3 event-detail-register-dropdown">
          <p>
            {user
              ? t(
                  "event.details.want-to-register",
                  'Do you want to reserve a seat as {USERNAME} for the event "{EVENTTITLE}" on the {DATE}? Your reservation is binding.',
                  {
                    USERNAME: user.getDisplayName(),
                    EVENTTITLE: event.title,
                    DATE: <strong>{dateFormat(event.startLocal)}</strong>,
                  },
                )
              : t(
                  "event.details.want-to-register.noUser",
                  'Do you want to reserve a seat for the event "{EVENTTITLE}" on the {DATE}? Your reservation is binding.',
                  {
                    EVENTTITLE: event.title,
                    DATE: <strong>{dateFormat(event.startLocal)}</strong>,
                  },
                )}
          </p>
          {PublicSettings.feature.rsvpWithCompanions &&
            (!event.maxParticipants ||
              event.maxParticipants - event.numberOfParticipants() > 1) && (
              <div className="mb-2">
                <FormCheck
                  id="register-with-companions"
                  type="switch"
                  label={t(
                    "event.details.register-with-companions",
                    "I want to reserve for two persons.",
                  )}
                  checked={registerWithCompanions}
                  onChange={(checked) => setRegisterWithCompanions(checked)}
                />
              </div>
            )}

          <div className="row justify-content-between align-items-center gap-3">
            <div className="col-lg-4 d-grid">
              <ButtonCancel id="register-panel-cancel" onClick={() => setRegisterDropdown(false)} />
            </div>
            <div className="col-lg-7 d-grid">
              <ButtonRegister
                forTwo={registerWithCompanions}
                onClick={async () => {
                  setRegisterDropdown(false);
                  await onRegister(registerWithCompanions ? 1 : 0);
                }}
                busy={busy}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
