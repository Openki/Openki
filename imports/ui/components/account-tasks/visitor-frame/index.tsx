import React, { useState } from "react";
import { Random } from "meteor/random";
import { AccountsAsync } from "/imports/utils/promisify";

import * as UsersMethods from "/imports/api/users/methods";

import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";
import { useSession } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";
import { useTranslation } from "react-i18next";

export type Props = {
  email: string;
  onRegister: () => void;
  onBack: () => void;
};

export function VistiorFrame(props: Props) {
  const { onRegister, onBack } = props;
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();
  const locale = useSession("locale");
  const [isBusy, setIsBusy] = useState(false);
  const [email, setEmail] = useState(props.email);
  const [errors, checkValidity, addError] = useValidation({
    noEmail: {
      text: () =>
        t("visitor.warning.noEmailProvided", "Please enter an email-address to continue."),
      field: "email",
      onCheckValidity: () => !!email,
    },
    "email invalid": {
      text: () => t("register.warning.emailNotValid"),
      field: "email",
    },
    "Email already exists.": {
      text: () =>
        t(
          "visitor.warning.emailExists",
          "This email already exists. Have you tried resetting your password?",
        ),
      field: "email",
    },
  });

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }

        setIsBusy(true);

        try {
          await AccountsAsync.createUser({
            email,
            password: Random.secret(),
            locale,
          } as any);

          onRegister();

          if (currentRegion) {
            await UsersMethods.regionChange(currentRegion._id);
          }

          await UsersMethods.updateLocale(locale);

          Analytics.trackEvent("Registers", "Visitor", currentRegion?.nameEn);
        } catch (err) {
          addError(err.reason);
        } finally {
          setIsBusy(false);
        }
      }}
    >
      <div className="mb-3">
        <div className="input-group has-validation">
          <span className="input-group-text">
            <span className="fa-solid fa-envelope fa-fw" aria-hidden="true"></span>
          </span>
          <input
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder={t("frame.visitor.email", "E-Mail")}
            type="email"
            autoFocus={true}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </div>
        {errors.email ? <div className="invalid-feedback">{errors.email}</div> : null}
      </div>
      <div className="mb-3">
        {t(
          "login.frame.visitor.mailDisclaimer",
          "Providing an e-mail address allows use to notify you eg. about new events.",
        )}
      </div>
      <div className="mb-3">
        <button type="submit" className="btn btn-add form-control" disabled={isBusy}>
          {isBusy ? (
            <>
              <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{" "}
              {t("login.visitor.submit.busy", "Registering…")}
            </>
          ) : (
            t("login.visitor.submit")
          )}
        </button>
      </div>
      <hr />
      <div className="mb-3">
        <button
          className="btn btn-secondary form-control"
          type="button"
          onClick={() => {
            onBack();
          }}
        >
          {t("login.visitor.backToLogin", "Go back to login")}
        </button>
      </div>
    </form>
  );
}
