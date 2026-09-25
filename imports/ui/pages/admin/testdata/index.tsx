import React from "react";
import { useTranslation } from "react-i18next";

import { clean, create } from "/imports/api/fixtures/methods";
import * as Alert from "/imports/api/alerts/alert";

import { Button } from "../../../components/Buttons";

export function TestdataPage() {
  const { t } = useTranslation();

  return (
    <>
      <h3>{t("testdata.title", "Testdata")}</h3>
      <div className="alert alert-info" role="alert">
        {t("testdata.description", "This process may take a few minutes to complete.")}
        <br />
        {t("testdata.hint", "This only works if testdata flag is set in the settings.")}
      </div>
      <Button
        id="admin-testdata-resetAll"
        className="btn-danger"
        onClick={async () => {
          if (
            !window.confirm(
              t(
                "testdata.clean.confirm",
                "By continuing, all data in all collections will be deleted.",
              ),
            )
          ) {
            return;
          }
          try {
            await clean();
            await create();
            Alert.success(t("testdata.finish", "Finish!"));
          } catch (e) {
            Alert.serverError(
              e,
              t("testdata.error", "An error occurred while resetting test data."),
            );
          }
        }}
      >
        <i className="fa-solid fa-fw fa-database" /> {t("testdata.resetAll", "Reset all data")}
      </Button>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminTestdataPage", () => TestdataPage);
