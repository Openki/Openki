import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Template } from "meteor/templating";

import { InvitationEntity, Status } from "/imports/api/invitations/invitations";
import { useFindFilter } from "/imports/api/invitations/publications";
import * as InvitationsMethods from "/imports/api/invitations/methods";
import * as Alert from "/imports/api/alerts/alert";

import { useDateTimeFormat } from "/imports/utils/react-moment-format";

import { ProfileLink } from "/imports/ui/components/profile-link";

function statusFormat(t: TFunction<"translation", undefined>, status: Status) {
  switch (status) {
    case "created":
      return t("invitations.status.created", "Created");
    case "send":
      return t("invitations.status.send", "Send");
    case "accepted":
      return t("invitations.status.accepted", "Accepted");
    case "failed":
      return t("invitations.status.failed", "failed");

    default:
      return status;
  }
}

function Invitations({
  tenantId,
  invitations,
}: {
  tenantId: string;
  invitations: InvitationEntity[];
}) {
  const { t } = useTranslation();
  const { dateFormat, timeFormat } = useDateTimeFormat();

  if (invitations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="row responsive-table-head">
        <div className="col-3">{t("invitations.list.to", "To")}</div>
        <div className="col-2">{t("invitations.list.status", "Status")}</div>
        <div className="col-3">{t("invitations.list.acceptedBy", "Accepted by")}</div>
        <div className="col-2">{t("invitations.list.createdAt", "Created At")}</div>
        <div className="col-2">
          {t("invitations.list.remove", "Remove")}&nbsp;
          <span
            className="fa-solid fa-circle-info fa-fw"
            data-bs-toggle="tooltip"
            data-bs-title={t(
              "invitations.list.remove.tooltip",
              "Removing the invitation has no effect on the member who has already accepted.",
            )}
            data-bs-custom-class="tooltip-compact"
          ></span>
        </div>
      </div>
      {invitations.map((invitation) => {
        return (
          <div key={invitation._id} className="row responsive-table-row">
            <div className="col-6 responsive-table-head">{t("invitations.list.to")}</div>
            <div className="col-6 col-md-3">{invitation.to}</div>

            <div className="col-6 responsive-table-head">{t("invitations.list.status")}</div>
            <div className="col-6 col-md-2">{statusFormat(t, invitation.status)}</div>

            <div className="col-6 responsive-table-head">{t("invitations.list.acceptedBy")}</div>
            <div className="col-6 col-md-3">
              {invitation.acceptedBy ? (
                <ProfileLink userId={invitation.acceptedBy as string} />
              ) : (
                "-"
              )}
            </div>

            <div className="col-6 responsive-table-head">{t("invitations.list.createdAt")}</div>
            <div
              className="col-6 col-md-2"
              title={`${dateFormat(invitation.createdAt)} ${timeFormat(invitation.createdAt)}`}
            >
              {dateFormat(invitation.createdAt)}
            </div>

            <div className="col-6 responsive-table-head">
              {t("invitations.list.remove")}
              <span
                className="fa-solid fa-circle-info fa-fw"
                data-bs-toggle="tooltip"
                data-bs-title={t("invitations.list.remove.tooltip")}
                data-tooltip-classes="tooltip-compact"
              ></span>
            </div>
            <div className="col-6 col-md-2">
              <button
                type="button"
                className="btn btn-sm btn-delete text-danger"
                onClick={async () => {
                  try {
                    await InvitationsMethods.remove(tenantId, invitation._id);
                  } catch (err) {
                    Alert.serverError(
                      err,
                      t(
                        "tenant.settings.invitations.removed.error",
                        "Invitations could not be removed.",
                      ),
                    );
                  }
                }}
              >
                <span className="fa-solid fa-trash-can" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export interface Props {
  tenantId: string;
}

export function InvitationsList({ tenantId }: Props) {
  const { t } = useTranslation();
  const [showAccepted, setShowAccepted] = useState(false);
  const [isLoading, invitations] = useFindFilter({ tenant: tenantId });

  const status: Status[] = ["created", "send", "failed"];

  if (showAccepted) {
    status.push("accepted");
  }

  if (isLoading()) {
    return null;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4"></div>

      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="invitationsListShowAcceptedCheck"
          onChange={(event) => {
            setShowAccepted(event.currentTarget.checked);
          }}
        />
        <label className="form-check-label" htmlFor="invitationsListShowAcceptedCheck">
          {t("invitations.list.showAccepted", "Show accepted invitations")}
        </label>
      </div>
      <Invitations
        tenantId={tenantId}
        invitations={invitations.filter((i) => status.includes(i.status))}
      />
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("InvitationsList", () => InvitationsList);
