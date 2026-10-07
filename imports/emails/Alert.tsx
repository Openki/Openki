import React, { ReactNode } from "react";
import { Accounts } from "meteor/accounts-base";
import moment from "moment";
import { VersionEntity } from "/imports/api/version/version";
import { useReactiveNow } from "../utils/reactive-now";

export function Alert({
  version,
  children,
}: {
  version?: VersionEntity | undefined;
  children?: ReactNode | undefined;
}) {
  const { siteName } = Accounts.emailTemplates;
  const now = useReactiveNow()

  moment.locale("en");
  let versionElement;
  if (version) {
    const fullVersion = version.basic + (version.branch !== "main" ? ` ${version.branch}` : "");
    const commit = version.commitShort;
    const deployDate = moment(version.activation).format("lll");
    const restart = moment(version.lastStart).format("lll");
    versionElement = (
      <>
        <br />
        The running version is [{siteName}] {fullVersion} @ commit {commit}
        <br />
        It was deployed on {deployDate},<br />
        and last restarted on {restart}.
      </>
    );
  }

  return (
    <>
      <tr>
        <td>
          <h5 className="title">Hi</h5>
          {children}
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {versionElement}
                <br />
                Now it&apos;s {now.toString()}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
