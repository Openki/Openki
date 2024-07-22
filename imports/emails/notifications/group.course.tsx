import React from "react";
import { useTranslation } from "react-i18next";
import { Router } from "meteor/iron:router";
import { UserModel } from "/imports/api/users/users";

export type Props = {
  unsubLink: string;
  course: React.JSX.Element;
  courseDescription: string;
  groups: React.JSX.Element;
  creater: UserModel;
  siteName: string;
  username: string;
  lng: string;
};

export function GroupCourse({
  unsubLink,
  course,
  courseDescription,
  groups,
  creater,
  siteName,
  username,
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
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {t(
                  "notification.group.course.mail.recpnote",
                  "You receive this message because you're a member of {GROUPS}.",
                  { GROUPS: groups },
                )}
              </td>
            </tr>
            <tr>
              <td>
                <a href={unsubLink}>
                  {t("email.base.unsubscribeLink.automatedNotifications", { SITENAME: siteName })}
                </a>
                &nbsp;
                <a href={Router.url("profile", { query: "campaign=groupCourseNotify" })}>
                  {t("email.base.profileLink")}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
