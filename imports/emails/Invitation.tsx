import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { TenantModel } from "/imports/api/tenants/tenants";
import { UserModel } from "/imports/api/users/users";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { PublicSettings } from "/imports/utils/PublicSettings";

export interface Props {
  siteName: string;
  tenant: TenantModel;
  inviter: UserModel;
  recipient: UserModel | undefined;
  invitationLink: string;
  reportEmail: JSX.Element;
  lng: string;
}

export function Invitation({
  siteName,
  tenant,
  inviter,
  recipient,
  invitationLink,
  reportEmail,
  lng,
}: Props) {
  const { t, i18n } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          <h5 className="title">
            {recipient
              ? t("email.base.greeting", {
                  USER: recipient.getDisplayName(),
                })
              : t("email.base.greeting.anoym")}
          </h5>
          <p>
            {t(
              "invitation.email.intro",
              'You have been invited by {INVITER} to join "{TENANT}" on {SITENAME}.',
              { INVITER: inviter.getDisplayName(), TENANT: tenant.name, SITENAME: siteName },
            )}
          </p>
          <p className="text-center">
            <a className="button" href={invitationLink}>
              {t("invitation.email.join", "Accept invitation")}
            </a>
          </p>
          <p className="gap-lg text-body-secondary">
            {t(
              "invitation.email.about",
              "{SITENAME} is a open peer-to-peer education platform where users collectively organize Groups. You can propose, discuss, develop and publish ideas and eventually meet nice people online or in real life. Enjoy sharing your experiences.",
              { SITENAME: siteName },
            )}{" "}
            <a href={getLocalizedValue(i18n, PublicSettings.aboutLink)}>
              {t("invitation.email.more", "Find out more")}
            </a>
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>{t("email.base.unexpected", { REPORTEMAIL: reportEmail })}</td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
