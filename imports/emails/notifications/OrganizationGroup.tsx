import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  group: JSX.Element;
  groupDescription: string;
  organizations: JSX.Element;
  creator: UserModel;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function OrganizationGroup({
  group,
  groupDescription,
  organizations,
  creator,
  username,
  unsubscribe,
  campaign,
  lng,
}: Props) {
  const { t } = useTranslation(undefined, { lng });
  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting", { USERNAME: username })}</h5>
          <p>
            {t(
              "notification.organization.course.mail.intro",
              "{CREATOR} just proposed {COURSE} in your organization {ORGANIZATIONS}.",
              { CREATOR: creator.getDisplayName(), COURSE: group, ORGANIZATIONS: organizations },
            )}
          </p>

          {!!groupDescription && (
            <table className="comment-box">
              <tr>
                <td dangerouslySetInnerHTML={{ __html: groupDescription }}></td>
              </tr>
            </table>
          )}

          <p>
            {t(
              "notification.organization.course.mail.next",
              "You can contact {CREATOR} in order to support and help organizing {COURSE}. You have the possibility to edit the description and announce events.",
              { CREATOR: creator.getDisplayName(), COURSE: group },
            )}
          </p>
        </td>
      </tr>

      <Footer
        receiveNote={t(
          "notification.organization.course.mail.recpnote",
          "You receive this message because you're a member of {ORGANIZATIONS}.",
          { ORGANIZATIONS: organizations },
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
