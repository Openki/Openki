import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export interface Props {
  course: JSX.Element;
  courseDescription: string;
  organizations: JSX.Element;
  creater: UserModel;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
}

export function OrganizationCourse({
  course,
  courseDescription,
  organizations,
  creater,
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
              "{CREATER} just proposed {COURSE} in your organization {ORGANIZATIONS}.",
              { CREATER: creater.getDisplayName(), COURSE: course, ORGANIZATIONS: organizations },
            )}
          </p>

          {!!courseDescription && (
            <table className="comment-box">
              <tr>
                <td dangerouslySetInnerHTML={{ __html: courseDescription }}></td>
              </tr>
            </table>
          )}

          <p>
            {t(
              "notification.organization.course.mail.next",
              "You can contact {CREATER} in order to support and help organizing {COURSE}. You have the possibility to edit the description and announce events.",
              { CREATER: creater.getDisplayName(), COURSE: course },
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
