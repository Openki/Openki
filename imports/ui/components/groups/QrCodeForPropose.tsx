import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

export function QrCodeForPropose(params: Record<string, string>) {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="mb-3">{t("qrCodeForPropose.title")}</h2>
      <QRCode value={Router.url("proposeGroup", {}, { query: params })} />
    </>
  );
}
