import React, { useEffect, useState } from "react";
import { checkSettings } from "/imports/api/settings/methods";
import { useTranslation } from "react-i18next";

export function Status() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Error[]>([]);

  useEffect(() => {
    (async function () {
      setErrors(await checkSettings());
    })();
  });

  if (errors.length === 0) {
    return null;
  }

  return (
    <span
      className="text-danger"
      title={`${t("footer.errorInSettings", "Error(s) in settings:")}\n ${errors
        .map((e) => e.message.replace("Match error: ", ""))
        .join("\n ")}`}
    >
      <i className="fa-solid fa-circle"></i>
    </span>
  );
}
