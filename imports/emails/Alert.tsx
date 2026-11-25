import { ReactNode } from "react";
import { Accounts } from "meteor/accounts-base";
import moment from "moment";
import { VersionEntity } from "/imports/api/version/version";
import { useReactiveNow } from "../utils/reactive-now";
import { Trans, useTranslation } from "react-i18next";

export function Alert({
  version,
  children,
  lng,
}: {
  version?: VersionEntity | undefined;
  children?: ReactNode | undefined;
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
          {children}
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr className="pre">
              <td>
                {versionElement}
                <Trans
                  i18nKey="email.admin.footer.now"
                  defaults="<br /><br />Now it's {now}."
                  values={{ now: now.toString() }}
                  components={{
                    br: <br />,
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
