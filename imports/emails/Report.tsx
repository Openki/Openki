import React, { JSX } from "react";
import { Accounts } from "meteor/accounts-base";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { UserModel } from "/imports/api/users/users";
import { VersionEntity } from "/imports/api/version/version";
import { useReactiveNow } from "../utils/reactive-now";

export function Report({
  user,
  version,
  location,
  title,
  report,
  userAgent,
}: {
  user: UserModel | null;
  version: VersionEntity | undefined;
  location: string;
  title: string;
  report: string;
  userAgent: string;
}) {
  const { siteName } = Accounts.emailTemplates;

  let reporter: string | JSX.Element = "A fellow visitor";
  if (user) {
    reporter = <a href={Router.url("userprofile", user)}>{user.getDisplayName()}</a>;
  }

  const now = useReactiveNow();

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
          <p>
            User {reporter} reports a problem on the page <a href={location}>&quot;{title}&quot;</a>
          </p>
          <p className="gap-md">Their report:</p>
          <table className="comment-box">
            <tr>
              <td>
                <p>{report}</p>
              </td>
            </tr>
          </table>
          <p>See you! bye.</p>
        </td>
      </tr>
      <tr>
        <td>
          <table className="footer">
            <tr>
              <td>
                {versionElement}
                <br />
                Now it&apos;s {now.toString()}.<br />
                User Agent: <code>{userAgent}</code>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </>
  );
}
