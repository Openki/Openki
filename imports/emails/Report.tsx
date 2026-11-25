import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { UserModel } from "/imports/api/users/users";
import { VersionEntity } from "/imports/api/version/version";
import { useReactiveNow } from "../utils/reactive-now";
import { Trans, useTranslation } from "react-i18next";

export type TransInterpolation = Record<string, string | number>;

export function Report({
  user,
  version,
  location,
  title,
  report,
  userAgent,
  lng,
}: {
  user: UserModel | null;
  version: VersionEntity | undefined;
  location: string;
  title: string;
  report: string;
  userAgent: string;
  lng: string;
}) {
  const { t } = useTranslation(undefined, { lng });
  const { siteName } = Accounts.emailTemplates;

  const now = useReactiveNow();

  moment.locale(lng);
  let versionElement;
  if (version) {
    const fullVersion = version.basic + (version.branch !== "main" ? ` ${version.branch}` : "");
    const commit = version.commitShort;
    const deployDate = moment(version.activation).format("lll");
    const restart = moment(version.lastStart).format("lll");
    versionElement = t(
      "email.admin.versionElement",
      "\nThe running version is [{SITENAME}] {FULLVERSION} @ commit {COMMIT}\nIt was deployed on {DEPLOYDATE},\nand last restarted on {RESTART}.",
      {
        SITENAME: siteName,
        FULLVERSION: fullVersion,
        COMMIT: commit,
        DEPLOYDATE: deployDate,
        RESTART: restart,
      },
    );
  }

  return (
    <>
      <tr>
        <td>
          <h5 className="title">{t("email.base.greeting.anoym", "Hi")}</h5>
          <Trans
            i18nKey="email.admin.userReport.intro"
            defaults='User <userLink>{user}</userLink> reports a problem on the page <pageLink>"{title}"</pageLink>'
            values={{
              user: user
                ? user.getDisplayName()
                : t("email.admin.userReport.visitor", "A fellow visitor"),
              title,
            }}
            components={{
              // oxlint-disable jsx-a11y/anchor-has-content jsx-a11y/control-has-associated-label
              userLink: user ? <a href={Router.url("userprofile", user)} /> : <></>,
              pageLink: <a href={location} />,
              // oxlint-enable jsx-a11y/anchor-has-content jsx-a11y/control-has-associated-label
            }}
          />
          <p className="gap-md">{t("email.admin.userReport.report", "Their report:")}</p>
          <table className="comment-box">
            <tr>
              <td>
                <p>{report}</p>
              </td>
            </tr>
          </table>
          <p>{t("email.admin.userReport.bye", "See you! bye.")}</p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr className="pre">
              <td>
                {versionElement}
                <Trans
                  i18nKey="email.admin.environmentInfo"
                  defaults="<br /><br />Now it's {now}.<br />User Agent: <code>{userAgent}</code>"
                  values={{
                    now: now.toString(),
                    userAgent,
                  }}
                  components={{
                    br: <br />,
                    code: <code />,
                  }}
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
