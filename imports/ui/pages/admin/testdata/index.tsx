/* eslint-disable no-alert */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { clean, create } from "/imports/api/fixtures/methods";
import * as Alert from "/imports/api/alerts/alert";

export function Button({
  className,
  onClick,
  children,
}: {
  className: string;
  onClick: () => Promise<void>;
  children: any;
}) {
  const [isBusy, setIsBusy] = useState(false);

  return (
    <button
      type="button"
      className={`${className} text-nowrap`}
      onClick={async () => {
        setIsBusy(true);
        try {
          await onClick();
        } finally {
          setIsBusy(false);
        }
      }}
    >
      {!isBusy ? (
        children
      ) : (
        <>
          <span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
        </>
      )}
    </button>
  );
}

export function TestdataPage() {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t("testdata.title", "Testdata")}</h3>
      <Button
        className="btn btn-success"
        onClick={async () => {
          try {
            await create();
            Alert.success(t("testdata.finish", "Finish!"));
          } catch (e) {
            Alert.error(e);
          }
        }}
      >
        {t("testdata.create", "Create")}
      </Button>{" "}
      <Button
        className="btn btn-danger"
        onClick={async () => {
          if (
            !window.confirm(
              t(
                "testdata.clean.confirm",
                "By continuing, all data in the Courses, Events, Venue and Groups collections will be deleted.",
              ),
            )
          ) {
            return;
          }
          try {
            await clean();
            Alert.success(t("testdata.finish", "Finish!"));
          } catch (e) {
            Alert.error(e);
          }
        }}
      >
        {t("testdata.clean", "Clean")}
      </Button>
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("AdminTestdataPage", () => TestdataPage);
