import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";

import { TenantModel } from "/imports/api/tenants/tenants";
import * as JoinLinks from "/imports/api/joinLinks/publications";
import * as JoinLinksMethods from "/imports/api/joinLinks/methods";

import { JoinLinkCreate } from "./Create";
import { JoinLinkRebuild } from "./rebuild";
import { DeleteConfirm, type Props as DeleteConfirmProps } from "../DeleteConfirm";

export interface Props {
  tenant: TenantModel;
}

export function JoinLink({ tenant }: Props) {
  const { t } = useTranslation();

  const [isLoading, joinLink] = JoinLinks.useDetails(tenant._id);

  function deleteConfirmAttr(): DeleteConfirmProps {
    return {
      confirmText: t(
        "joinLink.reallydelete",
        "Please confirm that you would like to delete this join link.",
      ),
      confirmButton: t("joinLink.confirm.button", "Delete this join link"),
      onRemove: async () => {
        await JoinLinksMethods.remove(tenant._id);
      },
      busyButton: t("joinLink.confirm.button.busy", "Deleting join link…"),
    };
  }

  if (isLoading()) {
    return null;
  }

  return (
    <div>
      <h3>
        <i className="fa-solid fa-chain fa-fw" /> {t("joinLink.title", "Invite via link")}
      </h3>
      <label className="form-label">
        {t("joinLink.description", "Anyone with this link can join your organisation as member.")}
      </label>

      {!joinLink ? (
        <JoinLinkCreate tenantId={tenant._id} />
      ) : (
        <>
          <input
            className="form-control mb-3"
            type="text"
            value={Router.url(
              "join",
              { token: joinLink.token },
              { query: { tenant: joinLink.tenant } },
            )}
            readOnly
          />

          <form className="row g-2 mb-2">
            <div className="col-auto">
              <JoinLinkRebuild tenantId={tenant._id} />
            </div>
            <div className="col-auto">
              <DeleteConfirm {...deleteConfirmAttr()} />
            </div>
          </form>
        </>
      )}
    </div>
  );
}
