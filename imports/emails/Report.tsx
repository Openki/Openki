import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";
import { IcuTrans, useTranslation } from "react-i18next";
import moment from "moment";

import { UserModel } from "/imports/api/users/users";
import { VersionEntity } from "/imports/api/version/version";
import { useReactiveNow } from "../utils/reactive-now";

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
      "email.admin.footer.version",
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
          <h5 className="title">{t("email.base.greeting.anoym")}</h5>
          <IcuTrans
            i18nKey="email.admin.userReport.intro"
            defaultTranslation='User <0>{USER}</0> reports a problem on the page <1>"{TITLE}"</1>'
            values={{
              USER: user
                ? user.getDisplayName()
                : t("email.admin.userReport.visitor", "A fellow visitor"),
              TITLE: title,
            }}
            content={[
              user ? (
                {
                  type: "a",
                  props: { href: Router.url("userprofile", user) },
                }
              ) : (
                <></>
              ),
              { type: "a", props: { href: location } },
            ]}
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
                <br />
                <br />
                <IcuTrans
                  i18nKey="email.admin.footer.now"
                  defaultTranslation="Now it's {NOW}."
                  values={{ NOW: now.toString() }}
                  content={[]}
                />
                <br />
                <IcuTrans
                  i18nKey="email.admin.footer.userAgent"
                  defaultTranslation="User Agent: <0>{USERAGENT}</0>"
                  values={{ USERAGENT: userAgent }}
                  content={[{ type: "code" }]}
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
