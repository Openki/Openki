import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";
import { getFragmentsWithKeys } from "/imports/ui/lib/getFragmentsWithKeys";

export interface Props {
  group: JSX.Element;
  groupLink: string;
  groupDescription: string;
  creator: UserModel;
  username: string;
  customSiteUrl: string;
  customSiteName: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function Group({
  group,
  groupLink,
  groupDescription,
  username,
  customSiteUrl,
  customSiteName,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USER: username })}</h5>
          <p className="pre">
            {getFragmentsWithKeys(
              t(
                "notification.group.mail.intro",
                'Congratulations, you successfully created "{GROUP}" on `{SITENAME}`.',
                { GROUP: group, SITENAME: <a href={customSiteUrl}>{customSiteName}</a> },
              ),
            )}
          </p>

          {!!groupDescription && (
            <>
              <p>
                {getFragmentsWithKeys(
                  t(
                    "notification.group.mail.description",
                    "Here is a copy of the description you entered:",
                    { GROUP: group, SITENAME: <a href={customSiteUrl}>{customSiteName}</a> },
                  ),
                )}
              </p>
              <table className="comment-box">
                <tr>
                  <td dangerouslySetInnerHTML={{ __html: groupDescription }}></td>
                </tr>
              </table>
            </>
          )}

          <p className="pre">
            {t(
              "notification.group.mail.next",
              "We will inform you if people join your proposal.\nHere is the link if you want to change something or add an image... Or invite your friends",
            )}
          </p>
          <p className="text-center">
            <a className="button" href={groupLink}>
              {t("notification.group.mail.replyButton.simple", "Visit my proposal")}
            </a>
          </p>
        </td>
      </tr>

      <Footer
        receiveNote={t(
          "notification.group.mail.recpnote",
          "You receive this message because you're the creator of this group.",
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
