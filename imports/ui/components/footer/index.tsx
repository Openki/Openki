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
  const { t } = useTranslation();
  const siteName = useSiteName();

  function links() {
    return PublicSettings.footerLinks.map((linkSpec) => ({
      link: linkSpec.link,
      text: linkSpec.key
        ? t(linkSpec.key, { SITENAME: siteName })
        : getLocalizedValue(linkSpec.text),
      title: linkSpec.title_key ? t(linkSpec.title_key, { SITENAME: siteName }) : "",
    }));
  }

  return (
    <>
      {links().map((l, index) => (
        <a key={index} className="footer-link" href={l.link} title={l.title}>
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

  function versionName() {
    return version && version.basic + (version.branch !== "main" ? ` ${version.branch}` : "");
  }
  function fullInfo() {
    return (
      version &&
      `${version.complete} on "${version.branch}" from ${version.commitDate} - restarted: ${moment(
        version.lastStart,
      )
        .locale(locale)
        .format("lll")}`
    );
  }

  function commit() {
    return version?.commitShort;
  }

  function deployed() {
    return version?.activation;
  }

  if (!isLoading()) {
    return (
      <footer className="footer bg-brand">
        <Links />
        <span title={fullInfo()} className="footer-deployed-version">
          {versionName()} {commit()} <Status />
          <br />
          {t("footer.deployedAt", "deployed:")} {moment(deployed()).locale(locale).format("L")}
        </span>
      </footer>
    );
  }
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

// for Blaze

import "./template.html";

Template.registerHelper("Footer", () => Footer);
