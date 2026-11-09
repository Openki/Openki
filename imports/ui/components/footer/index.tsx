import { Template } from "meteor/templating";
import moment from "moment";
import { Session } from "meteor/session";
import { useTranslation } from "react-i18next";
import React from "react";
import { useTracker } from "meteor/react-meteor-data";

import { useDetails } from "/imports/api/version/publications";

import { useSiteName } from "/imports/utils/getSiteName";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { Status } from "./status";

import "./styles.scss";

function Links() {
  const { getLocalizedValue } = useLocalizedSetting();
  const siteName = useSiteName();

  const links = PublicSettings.footerLinks.map((linkSpec) => ({
    link: linkSpec.link,
    text: getLocalizedValue(linkSpec.key || linkSpec.text, { SITENAME: siteName }),
    title: getLocalizedValue(linkSpec.title_key || linkSpec.title, { SITENAME: siteName }),
  }));

  return (
    <>
      {links.map((l) => (
        <a key={l.link} className="footer-link" href={l.link} title={l.title}>
          {l.text}
        </a>
      ))}
    </>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const [isLoading, version] = useDetails();
  const locale = useTracker(() => Session.get("timeLocale")) || "en";

  if (isLoading()) {
    return (
      <footer className="footer bg-brand">
        <Links />
        <span className="footer-deployed-version">
          <span className="placeholder" style={{ minWidth: "100px" }}></span>
          <br />
          <span className="placeholder" style={{ minWidth: "100px" }}></span>
        </span>
      </footer>
    );
  }

  const fullInfo =
    version &&
    `${version.complete} on "${version.branch}" from ${version.commitDate} - restarted: ${moment(
      version.lastStart,
    )
      .locale(locale)
      .format("lll")}`;

  const branch = !!version && (version.branch !== "main" ? ` ${version.branch} ` : "");

  const commit = version?.commitShort;
  const deployed = version?.activation;

  const commitLink = `https://gitlab.com/Openki/Openki/-/tree/${commit}`;

  // This should result in a link to a changelog tag:
  // https://gitlab.com/Openki/Openki/-/blob/dev/CHANGELOG.md#v0140---2026-11-09
  // We assume that the commit date is the same date as in the changelog.
  // This might not always be the case, but it's good enough.
  const releaseNotesLinkForTag = `https://gitlab.com/Openki/Openki/-/blob/dev/CHANGELOG.md#${version?.basic.replaceAll(".", "")}---${new Date(version?.commitDate ?? "").toISOString().slice(0, 10)}`;

  return (
    <footer className="footer bg-brand">
      <Links />
      <span title={fullInfo} className="footer-deployed-version">
        <a href={releaseNotesLinkForTag} target="_blank" rel="noreferrer">
          {version?.basic}
        </a>
        {branch}
        <a href={commitLink} target="_blank" rel="noreferrer">
          {commit}
        </a>{" "}
        <Status />
        <br />
        {t("footer.deployedAt", "deployed:")} {moment(deployed).locale(locale).format("L")}
      </span>
    </footer>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Footer", () => Footer);
