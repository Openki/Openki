import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Shareon from "shareon";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import * as Analytics from "/imports/ui/lib/analytics";

import "shareon/dist/shareon.min.css";
import "./styles.scss";
import { PublicSettings } from "/imports/utils/PublicSettings";

export function Sharing({
  title = "",
  text = "",
  url = "",
}: {
  title?: string | undefined;
  text?: string | undefined;
  url?: string | undefined;
}) {
  const { t } = useTranslation();
  const currentRegion = useCurrentRegion();
  const [showAll, setShowAll] = useState(false);
  text = text || t("sharing.mailbody.quote", "Hi!\nLook what I found, are you interested?");

  const btnText: Record<string, string> = {
    bluesky: t("sharing.bluesky.text", "Share"),
    facebook: t("sharing.facebook.text", ""),
    fediverse: t("sharing.fediverse.text", ""),
    hackernews: t("sharing.hackernews.text", ""),
    linkedin: t("sharing.linkedin.text", ""),
    mastodon: t("sharing.mastodon.text", "Toot"),
    odnoklassniki: t("sharing.odnoklassniki.text", ""),
    pinterest: t("sharing.pinterest.text", ""),
    pocket: t("sharing.pocket.text", ""),
    reddit: t("sharing.reddit.text", ""),
    teams: t("sharing.teams.text", ""),
    telegram: t("sharing.telegram.text", ""),
    tumblr: t("sharing.tumblr.text", ""),
    twitter: t("sharing.twitter.text", ""),
    viber: t("sharing.viber.text", ""),
    vkontakte: t("sharing.vkontakte.text", ""),
    whatsapp: t("sharing.whatsapp.text", ""),
    "copy-url": t("sharing.copy-url.text", "Copy URL"),
    email: t("sharing.email.text", ""),
  };

  const networkTitle: Record<string, string> = {
    bluesky: t("sharing.bluesky.title", "Bluesky"),
    facebook: t("sharing.facebook.title", "Facebook"),
    fediverse: t("sharing.fediverse.title", "Fediverse"),
    hackernews: t("sharing.hackernews.title", "Hacker News"),
    linkedin: t("sharing.linkedin.title", "LinkedIn"),
    mastodon: t("sharing.mastodon.title", "Mastodon"),
    odnoklassniki: t("sharing.odnoklassniki.title", "Одноклассники"),
    pinterest: t("sharing.pinterest.title", "Pinterest"),
    pocket: t("sharing.pocket.title", "Pocket"),
    reddit: t("sharing.reddit.title", "Reddit"),
    teams: t("sharing.teams.title", "Microsoft Teams"),
    telegram: t("sharing.telegram.title", "Telegram"),
    tumblr: t("sharing.tumblr.title", "Tumblr"),
    twitter: t("sharing.twitter.title", "Twitter"),
    viber: t("sharing.viber.title", "Viber"),
    vkontakte: t("sharing.vkontakte.title", "VK"),
    whatsapp: t("sharing.whatsapp.title", "WhatsApp"),
    "copy-url": t("sharing.copy-url.title", "Copy URL to clipboard"),
    email: t("sharing.email.title", "Email"),
  };

  useEffect(() => {
    if (showAll) {
      Shareon.init();
    }
  }, [showAll]);

  if (!showAll) {
    return (
      <span className="shareon">
        <a
          className="web-share"
          onClick={function (event) {
            event.preventDefault();

            const data = {
              title,
              text,
              url,
            };

            if (navigator.canShare && navigator.canShare(data)) {
              navigator.share(data);
              Analytics.trackEvent("social", "web-share clicked", currentRegion?.nameEn);
            } else {
              // fallback if browser not support sharing api
              setShowAll(true);
            }
          }}
        >
          {t("sharing.web-share.text", "Share")}
        </a>
      </span>
    );
  }

  return (
    <div className="shareon" data-url={url} data-title={title} data-text={text}>
      {PublicSettings.feature.socialMediaButtons.map((network) => (
        <a
          key={network}
          className={network}
          onClick={() => {
            Analytics.trackEvent("social", `${network} clicked`, currentRegion?.nameEn);
          }}
          title={networkTitle[network]}
        >
          {btnText[network]}
        </a>
      ))}
    </div>
  );
}
