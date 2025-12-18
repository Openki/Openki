import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Shareon from "shareon";
import { useCurrentRegion } from "/imports/utils/useCurrentRegion";

import * as Analytics from "/imports/ui/lib/analytics";

import "shareon/dist/shareon.min.css";
import "./styles.scss";
import { PublicSettings } from "/imports/utils/PublicSettings";

export function Sharing({
  title = document.title,
  text = "",
  url = location.href,
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
    bluesky: t("sharing.bluesky.text", ""),
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
    email: t("sharing.email.text", "email"),
  };

  const networkTitle: Record<string, string> = {
    bluesky: t("sharing.bluesky.title", "Share on Bluesky"),
    facebook: t("sharing.facebook.title", "Share on Facebook"),
    fediverse: t("sharing.fediverse.title", "Share on Fediverse"),
    hackernews: t("sharing.hackernews.title", "Share on Hacker News"),
    linkedin: t("sharing.linkedin.title", "Share on LinkedIn"),
    mastodon: t("sharing.mastodon.title", "Share on Mastodon"),
    odnoklassniki: t("sharing.odnoklassniki.title", "Share on Одноклассники"),
    pinterest: t("sharing.pinterest.title", "Share on Pinterest"),
    pocket: t("sharing.pocket.title", "Save to Pocket"),
    reddit: t("sharing.reddit.title", "Share on Reddit"),
    teams: t("sharing.teams.title", "Share via Microsoft Teams"),
    telegram: t("sharing.telegram.title", "Share via Telegram"),
    tumblr: t("sharing.tumblr.title", "Share on Tumblr"),
    twitter: t("sharing.twitter.title", "Share on Twitter"),
    viber: t("sharing.viber.title", "Share via Viber"),
    vkontakte: t("sharing.vkontakte.title", "Share on VK"),
    whatsapp: t("sharing.whatsapp.title", "Share via WhatsApp"),
    "copy-url": t("sharing.copy-url.title", "Copy URL to Clipboard"),
    email: t("sharing.email.title", "Share via Email"),
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
          href="#"
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
          href="#"
          className={network}
          onClick={() => {
            Analytics.trackEvent("social", `${network} clicked`, currentRegion?.nameEn);
          }}
          title={networkTitle[network]}
          tabIndex={0}
        >
          {btnText[network]}
        </a>
      ))}
    </div>
  );
}
