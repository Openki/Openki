import React from "react";
import { useTranslation } from "react-i18next";

export function TestWarningTicker() {
  const { t } = useTranslation();

  return (
    <>
      {/* @ts-expect-error react do not known marquee */}
      <marquee
        // oxlint-disable-next-line react/no-unknown-property
        bgcolor="#000"
        direction="left"
        // oxlint-disable-next-line react/no-unknown-property
        scrollamount="5"
        // oxlint-disable-next-line react/no-unknown-property
        scrolldelay="1"
        style={{ color: "white", position: "absolute", top: "50px" }}
      >
        ⚠ &nbsp; {t("menue.Testpage", "This is only a testpage.")} &nbsp; ⚠
        <span style={{ paddingLeft: "10em" }}> </span>☠ &nbsp;{" "}
        {t("menue.Testpage2", "All data will be erased regularly.")} &nbsp; ☠
        <span style={{ paddingLeft: "10em" }}> </span>
        {/* @ts-expect-error react do not known marquee */}
      </marquee>
    </>
  );
}
