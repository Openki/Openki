import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { EventModel } from "/imports/api/events/events";

import { Button, ButtonCancel } from "../../../../Buttons";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { FormCheck } from "/imports/ui/components/FormCheck";

function ButtonRegister(props: { forTwo: boolean; onClick: () => Promise<void> }) {
  const { t } = useTranslation();

  return (
    <Button
      id="events-display-registration"
      needsLogin
      visitorUserAllowed
      size="large"
      className="btn-add"
      onClick={props.onClick}
      busyText={t("_button.registering", "Registering…")}
    >
      <strong>
        {!props.forTwo
          ? t("event.details.register-register", "Register")
          : t("event.details.register-registerForTwo", "Register for 2 seats")}
      </strong>
    </Button>
  );
}

export interface Props {
  event: EventModel;
  onRegister: (companions: number) => Promise<void>;
}

export function RegisterPanel({ event, onRegister }: Props) {
  const { t } = useTranslation();
  const user = useUser();
  const { dateFormat } = useDateTimeFormat();
  const [registerDropdown, setRegisterDropdown] = useState(false);
  const [registerWithCompanions, setRegisterWithCompanions] = useState(false);

  return (
    <>
      {!registerDropdown ? (
        <Button
          id="register-panel-reserve"
          className="btn-add"
          size="large"
          onClick={() => {
            setRegisterDropdown(true);
          }}
        >
          <strong>{t("event.details.reserve-a-seat", "Reserve a seat")}</strong>
        </Button>
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
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
