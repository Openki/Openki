import React from "react";
import { useTranslation } from "react-i18next";
import { UserModel } from "/imports/api/users/users";
import { Footer } from "./components/Footer";
import { Props as UnsubscribeLinkProps } from "./components/UnsubscribeLink";

export type Props = {
  course: React.JSX.Element;
  courseDescription: string;
  groups: React.JSX.Element;
  creater: UserModel;
  username: string;
  unsubscribe: Omit<UnsubscribeLinkProps, "lng">;
  campaign: string;
  lng: string;
};

export function GroupCourse({
  course,
  courseDescription,
  groups,
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
              "notification.group.course.mail.intro",
              "{CREATER} just proposed {COURSE} in your group {GROUPS}.",
              { CREATER: creater.getDisplayName(), COURSE: course, GROUPS: groups },
            )}
          </p>

          {courseDescription ? (
            <table className="comment-box">
              <tr>
                <td dangerouslySetInnerHTML={{ __html: courseDescription }}></td>
              </tr>
            </table>
          ) : null}

          <p>
            {t(
              "notification.group.course.mail.next",
              "You can contact {CREATER} in order to support and help organizing {COURSE}. You have the possibility to edit the  description and announce events.",
              { CREATER: creater.getDisplayName(), COURSE: course },
            )}
          </p>
        </td>
      </tr>

      <Footer
        receiveNote={t(
          "notification.group.course.mail.recpnote",
          "You receive this message because you're a member of {GROUPS}.",
          { GROUPS: groups },
        )}
        unsubscribe={unsubscribe}
        campaign={campaign}
        lng={lng}
      />
    </>
  );
}
