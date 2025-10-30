import { omitBy } from "lodash";
import { Session } from "meteor/session";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Shariff from "shariff";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import * as Analytics from "/imports/ui/lib/analytics";

import "./styles.scss";

export function Sharing({
  title,
  text,
  url,
}: {
  title?: string | undefined;
  text?: string | undefined;
  url?: string | undefined;
}) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();
  const shariffElementRef = useRef<HTMLDivElement>(null);

  text = text || t("sharing.mailbody.quote", "Hi!\nLook what I found, are you interested?");

  useEffect(() => {
    if (!shariffElementRef.current) {
      return;
    }

    const $shariff = $(shariffElementRef.current);

    new Shariff(
      $shariff,
      omitBy(
        {
          lang: Session.get("locale"),
          mailUrl: "mailto:",
          services: ["linkedin", "twitter", "facebook", "telegram", "whatsapp", "mail"],
          title,
          mailBody: [text, "{url}"].join("\n\n"),
          url,
        },
        (v) => !v,
      ),
    );

    $shariff.find(".fab, .fas").addClass("fa fa-fw");

    $shariff.on("click", "a", function (event) {
      // this reads out which social button it is, e.g. facebook, twitter
      const source = $(event.currentTarget)
        .parent()
        .attr("class")
        ?.replace("shariff-button", "")
        .trim();

      Analytics.trackEvent("social", `${source} clicked`, currentRegion?.nameEn);
    });
  });

  return <div ref={shariffElementRef} className="shariff mt-1"></div>;
}
