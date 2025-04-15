import React from "react";
import ReactMarkdown from "react-markdown";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import "./styles.scss";

export function DataProtectionLaw() {
  const { getLocalizedValue } = useLocalizedSetting();

  const dataProtectionLaw = getLocalizedValue(PublicSettings.dataProtectionLaw);

  if (!dataProtectionLaw) {
    return null;
  }

  return (
    <div className="mb-3 register-data-protection-law text-body-secondary">
      <ReactMarkdown linkTarget="_blank">{dataProtectionLaw}</ReactMarkdown>
    </div>
  );
}
