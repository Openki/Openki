import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as InvitationsMethods from "/imports/api/invitations/methods";
import * as Alert from "/imports/api/alerts/alert";
import { TenantEntity } from "/imports/api/tenants/tenants";

import { isEmail } from "/imports/utils/email-tools";
import { useValidation } from "/imports/ui/lib/useValidation";
import { FormControl } from "/imports/ui/components/form-control";
import { Button } from "/imports/ui/components/Buttons";

export interface Props {
  tenant: TenantEntity;
}

export function Create({ tenant }: Props) {
  const { t } = useTranslation();

  const [emailsInput, setEmailsInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const [errors, checkValidity, addError, resetErrors] = useValidation(
    {
      notValid: {
        text: () =>
          t(
            "tenant.settings.invitations.error.notValid",
            "Some of the e-mail addresses are invalid.",
          ),
        field: "emails",
        isValid: () => {
          const emails = getLines();
          return emails.length > 0 && emails.every((e) => isEmail(e));
        },
      },
    },
    { autoCheckFixed: true },
  );

  function reset() {
    resetErrors();
    setEmailsInput("");
  }

  function getLines() {
    return emailsInput.split(/[\s;,|]+/g).filter((line) => !!line);
  }

  function normalizeList() {
    const normalized = getLines().join("\n");
    setEmailsInput(normalized);
  }

  function getEmails() {
    return getLines().filter((e) => isEmail(e));
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!checkValidity()) {
      setTimeout(() => {
        document.querySelector<HTMLElement>(".is-invalid")?.focus();
      }, 0);
      return;
    }

    setIsBusy(true);

    try {
      await InvitationsMethods.createMany(tenant._id, getEmails());

      Alert.success(
        t("tenant.settings.invitations.creation.success", "Invitations have been created."),
      );

      reset();
    } catch (err) {
      if (!(err instanceof Meteor.Error && err.reason && addError(err.reason))) {
        // unknown error
        Alert.serverError(
          err,
          t("tenant.settings.invitations.creation.error", "Invitations could not be created."),
        );
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="mb-3">
        <FormControl
          id="tenant-invitations-create-emails"
          type="textarea"
          rows={5}
          label={t(
            "invitations.create.field.emails",
            "Send e-mail invitations to join {TENANT}. Each invitation can only be used once.",
            { TENANT: tenant.name },
          )}
          placeholder={t(
            "invitations.create.field.emails.placeholder",
            "Add an e-mail address or a list of e-mail addresses.",
          )}
          value={emailsInput}
          onChange={(value) => setEmailsInput(value)}
          onBlur={() => {
            normalizeList();
            checkValidity("emails");
          }}
          error={errors.emails}
        />
      </div>
      <Button id="invitations-create-submit" submit className="btn-add" isBusy={isBusy}>
        {t("invitations.create.button.text", "Send invitation")}
      </Button>
    </form>
  );
}
