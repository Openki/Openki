import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import * as JoinLinks from "/imports/api/joinLinks/methods";

import { ButtonCancel } from "../../Buttons";

import "./styles.scss";

export interface Props {
  tenantId: string;
}

export function JoinLinkRebuild({ tenantId }: Props) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => {
          setConfirm(true);
        }}
      >
        {t("joinLink.rebuild", "Create a new link")}
      </button>
    );
  }

  return (
    <div className="join-link-rebuild-confirmation">
      <p>
        {t(
          "joinLink.reallyrebuild",
          "Please confirm that you would like to create a new link. Existing link will be revoked.",
        )}
      </p>
      <div className="form-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={async () => {
            await JoinLinks.create(tenantId);
            setConfirm(false);
          }}
        >
          {t("joinLink.rebuild", "Create a new link")}
        </button>
        <ButtonCancel id="joinLink-rebuild-cancel" onClick={() => setConfirm(false)} />
      </div>
    </div>
  );
}
