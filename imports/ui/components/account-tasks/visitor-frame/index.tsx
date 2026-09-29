import { Router } from "meteor/iron:router";
import { Random } from "meteor/random";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useSession } from "/imports/utils/react-meteor-data";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import * as UsersMethods from "/imports/api/users/methods";
import * as Alert from "/imports/api/alerts/alert";

import * as Analytics from "/imports/ui/lib/analytics";
import { useValidation } from "/imports/ui/lib/useValidation";

import { NotAllowedCharacters } from "/imports/startup/both/NotAllowedCharacters";
import { DataProtectionLaw } from "../data-protection-law";
import { FormCheck } from "/imports/ui/components/FormCheck";
import { FormControl } from "/imports/ui/components/form-control";
import { Button } from "../../Buttons";

export interface Props {
  username: string;
  email: string;
  allowNews: boolean;
  onRegister: () => void;
  onBack: () => void;
}

export function VistiorFrame({ username, email, allowNews, onRegister, onBack }: Props) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();
  const sitename = useSiteName();
  const locale = useSession("locale");
  const [isBusy, setIsBusy] = useState(false);
  const [registerData, setRegisterData] = useState({ username, email, allowNews });
  const [errors, checkValidity, addError] = useValidation({
    noUsername: {
      text: () => t("register.warning.noUserName", "Please enter a name for your new user."),
      field: "username",
      isValid: () => !!registerData.username,
    },
    "Not allowed character": {
      text: () =>
        t("register.warning.notAllowedCharacter", "{CHARACTERS} not allowed in username.", {
          CHARACTERS: NotAllowedCharacters.join(", "),
        }),
      field: "username",
    },
    "Username already exists.": {
      text: () =>
        t(
          "register.warning.userExists",
          "This username is already in use. Please choose another one.",
        ),
      field: "username",
    },
    noEmail: {
      text: () =>
        t("visitor.warning.noEmailProvided", "Please enter an email-address to continue."),
      field: "email",
      isValid: () => !!registerData.email,
    },
    "email invalid": {
      text: () => t("register.warning.emailNotValid"),
      field: "email",
    },
    "Email already exists.": {
      text: () => (
        <div className="whitespace-pre-line">
          {t("register.warning.emailExists")}
          <br />
          <a href={Router.path("resetPasswordEmail", {}, { query: { email: registerData.email } })}>
            {t("register.warning.emailExists.sendEmail")}
          </a>
        </div>
      ),
      field: "email",
    },
  });
  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();

        if (!checkValidity()) {
          return;
        }

        setIsBusy(true);

        try {
          await Accounts.createUserAsync({
            ...registerData,
            visitor: true, // used in useraccounts-configuration.ts to set privileges
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
          if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
            // unknown error
            Alert.serverError(err);
          }
        } finally {
          setIsBusy(false);
        }
      }}
    >
      <div className="mb-3">
        <FormControl
          id="visitor-frame-username"
          type="text"
          label={t("frame.login.username", "Username")}
          prepend="fa-solid fa-user fa-fw"
          autoFocus
          value={registerData.username}
          onChange={(value) => setRegisterData({ ...registerData, username: value })}
          error={errors.username}
        />
      </div>
      <div className="mb-3">
        <FormControl
          id="visitor-frame-email"
          type="email"
          label={t("frame.visitor.email", "E-Mail")}
          prepend="fa-solid fa-envelope fa-fw"
          value={registerData.email}
          onChange={(value) => setRegisterData({ ...registerData, email: value })}
          error={errors.email}
        />
      </div>
      <div className="mb-3">
        {t(
          "login.frame.visitor.mailDisclaimer",
          "Providing an e-mail address allows use to notify you eg. about new events.",
        )}
      </div>
      <DataProtectionLaw />
      {PublicSettings.askNewsletterConsent && (
        <div className="mb-3">
          <FormCheck
            id="visitor-frame-allowNews"
            type="box"
            label={t(
              "login.register.agreeEmails",
              "I agree on receiving occasional emails about {SITENAME}.",
              { SITENAME: sitename },
            )}
            checked={registerData.allowNews}
            onChange={(checked) => setRegisterData({ ...registerData, allowNews: checked })}
          />
        </div>
      )}
      <div className="mb-3">
        <Button
          id="visitor-frame-submit"
          submit
          block
          className="btn-add"
          busyText={t("login.visitor.submit.busy", "Registering…")}
          isBusy={isBusy}
        >
          {t("login.visitor.submit")}
        </Button>
      </div>
      <hr />
      <Button id="visitor-frame-back" block className="btn-secondary" onClick={() => onBack()}>
        {t("login.visitor.backToLogin", "Go back to login")}
      </Button>
    </form>
  );
}
