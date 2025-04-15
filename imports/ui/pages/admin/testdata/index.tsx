import React from "react";
import { useTranslation } from "react-i18next";

import { clean, create } from "/imports/api/fixtures/methods";
import * as Alert from "/imports/api/alerts/alert";
import { updateDbCacheFields } from "/imports/api/db-utilities/updateDbCacheFields";

import { Button } from "/imports/ui/components/buttons";

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
        className="btn btn-lg btn-danger"
        onClick={async () => {
          if (
            // eslint-disable-next-line no-alert
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
            await updateDbCacheFields();
            Alert.success(t("testdata.finish", "Finish!"));
          } catch (e) {
            Alert.error(e);
          }
        }}
      >
        <i className="fa-solid fa-fw fa-database"></i> {t("testdata.resetAll", "Reset all data")}
      </Button>
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("AdminTestdataPage", () => TestdataPage);
