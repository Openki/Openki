import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UnsubscribeLink, Props as UnsubscribeLinkProps } from "./UnsubscribeLink";

export type Props = {
  receiveNote?: string | undefined;
  children?: any | undefined;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  spamPrevention?: boolean | undefined;
  campaign: string;
  lng: string;
};

export function Footer({
  receiveNote,
  unsubscribe,
  spamPrevention = false,
  children,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

  return (
    <tr>
      <td>
        <table className="footer">
          {receiveNote ? (
            <tr>
              <td>{receiveNote}</td>
            </tr>
          ) : null}
          {children ? (
            <tr>
              <td>{children}</td>
            </tr>
          ) : null}
          <tr>
            <td>
              {<UnsubscribeLink {...unsubscribe} lng={lng} />}
              &nbsp;
              <a href={Router.url("profile", {}, { query: { campaign } })}>
                {t("email.base.profileLink")}
              </a>
            </td>
          </tr>
          {spamPrevention ? (
            <tr>
              <td style={{ paddingTop: "16px" }}>
                {t("email.base.spamPrevention", {
                  MAIL: <span style={{ color: "blue" }}>{PrivateSettings.siteEmail}</span>,
                })}
              </td>
            </tr>
          ) : null}
        </table>
      </td>
    </tr>
  );
}
