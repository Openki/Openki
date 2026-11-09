import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { checkSettings } from "/imports/api/settings/methods";

export function Status() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Awaited<ReturnType<typeof checkSettings>>>();

  useEffect(() => {
    if (!errors) {
      (async function () {
        setErrors(await checkSettings());
      })();
    }
  });

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <span
      className="text-danger"
      title={`${t("footer.errorInSettings", "Error(s) in settings:")}\n ${errors
        .map((e) => {
          console.error(e);

          if (e instanceof Error || "errorType" in e) {
            return e.message.replace("Match error: ", "");
          } else {
            return "Unknown error in settings: See console for details";
          }
        })
        .join("\n ")}`}
    >
      <i className="fa-solid fa-circle" />
    </span>
  );
}
