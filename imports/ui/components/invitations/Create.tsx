import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import * as InvitationsMethods from "/imports/api/invitations/methods";
import * as Alert from "/imports/api/alerts/alert";
import { TenantEntity } from "/imports/api/tenants/tenants";

import { isEmail } from "/imports/utils/email-tools";
import { useValidation } from "/imports/ui/lib/useValidation";

export interface Props {
  tenant: TenantEntity;
}

export function Create({ tenant }: Props) {
  const { t } = useTranslation();

  const [emailsInput, setEmailsInput] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [tried, setTried] = useState(false);

  const [errors, checkValidity, , resetErrors] = useValidation({
    notValid: {
      text: () =>
        t(
          "tenant.settings.invitations.error.notValid",
          "Some of the e-mail addresses are invalid.",
        ),
      field: "emails",
      onCheckValidity: () => {
        const emails = getLines();
        return emails.length > 0 && emails.every((e) => isEmail(e));
      },
    },
  });

  function reset() {
    resetErrors();
    setEmailsInput("");
    setTried(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setTried(true);

    const isValid = checkValidity();
    if (!isValid) return;

    setIsBusy(true);

    try {
      await InvitationsMethods.createMany(tenant._id, getEmails());

      Alert.success(
        t("tenant.settings.invitations.creation.success", "Invitations have been created."),
      );

      reset();
    } catch (err) {
      Alert.serverError(
        err,
        t("tenant.settings.invitations.creation.error", "Invitations could not be created."),
      );
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    if (tried) {
      checkValidity();
    }
  }, [emailsInput]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3 {{errorClass 'invitations-emails'}}">
        <label className="form-label">
          {t(
            "invitations.create.field.emails",
            'Send e-mail invitations to join {TENANTNAME}. Each invitation can only be used once.',
            { TENANTNAME: tenant.name },
          )}
        </label>
        <textarea
          className={`form-control ${errors.emails ? "is-invalid" : ""}`}
          rows={5}
          placeholder={t(
            "invitations.create.field.emails.placeholder",
            "Add an e-mail address or a list of e-mail addresses.",
          )}
          value={emailsInput}
          onBlur={normalizeList}
          onChange={(e) => setEmailsInput(e.target.value)}
        ></textarea>
        {!!errors.emails && <div className="invalid-feedback">{errors.emails}</div>}
      </div>
      <button type="submit" className="btn btn-add" disabled={isBusy || !!errors.emails}>
        {t("invitations.create.button.text", "Send invitation")}
      </button>
    </form>
  );
}
