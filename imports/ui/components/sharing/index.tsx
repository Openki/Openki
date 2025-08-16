import Shariff from "shariff";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from "react";
import { Template } from "meteor/templating";
import { Session } from "meteor/session";

import * as Analytics from "/imports/ui/lib/analytics";

import "./styles.scss";

export function Sharing({ align }: { align?: "start" | "end" }) {
  const { t } = useTranslation();
  const shariffElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shariffElementRef.current) {
      return;
    }

    const $shariff = $(shariffElementRef.current);

    new Shariff($shariff, {
      lang: Session.get("locale"),
      mailUrl: "mailto:",
      services: ["linkedin", "twitter", "facebook", "telegram", "whatsapp", "mail"],
    });

    $shariff.find(".fab, .fas").addClass("fa fa-fw");

    $shariff.on("click", "a", function (event) {
      // this reads out which social button it is, e.g. facebook, twitter
      const source = $(event.currentTarget)
        .parent()
        .attr("class")
        ?.replace("shariff-button", "")
        .trim();

      Analytics.trackEvent("social", `${source} clicked`);
    });
  });

  return (
    <div className={`shariff-wrapper${align === "end" ? " text-end" : ""}`}>
      <h4>{t("sharing.title", "Invite your friends")}</h4>
      <div
        ref={shariffElementRef}
        className="shariff"
        data-mail-body={`${t(
          "sharing.mailbody.quote",
          "look what I found, are you interested?",
        )} {url}`}
      ></div>
    </div>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Sharing", () => Sharing);
