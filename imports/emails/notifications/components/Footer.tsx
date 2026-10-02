import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { PrivateSettings } from "/imports/utils/PrivateSettings";
import { UnsubscribeLink, Props as UnsubscribeLinkProps } from "./UnsubscribeLink";
import { getFragmentsWithKeys } from "/imports/ui/lib/getFragmentsWithKeys";

export interface Props {
  receiveNote?: ReactNode | undefined;
  children?: ReactNode | undefined;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  spamPrevention?: boolean | undefined;
  campaign: string;
  lng: string;
}

export function Footer({
  receiveNote,
  unsubscribe,
  spamPrevention,
  children,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

  return (
    <tr>
      <td>
        <table className="footer">
          {!!receiveNote && (
            <tr>
              <td>{receiveNote}</td>
            </tr>
          )}
          {!!children && (
            <tr>
              <td>{children}</td>
            </tr>
          )}
          <tr>
            <td>
              {<UnsubscribeLink {...unsubscribe} lng={lng} />}
              &nbsp;
              <a href={Router.url("profile", {}, { query: { campaign } })}>
                {t("email.base.profileLink")}
              </a>
            </td>
          </tr>
          {!!spamPrevention && (
            <tr>
              <td style={{ paddingTop: "16px" }}>
                {getFragmentsWithKeys(
                  t("email.base.spamPrevention", {
                    MAIL: Boolean(PrivateSettings.siteEmail) && (
                      <a href={"mailto:" + PrivateSettings.siteEmail}>
                        {PrivateSettings.siteEmail}
                      </a>
                    ),
                  }),
                )}
              </td>
            </tr>
          )}
        </table>
      </td>
    </tr>
  );
}
