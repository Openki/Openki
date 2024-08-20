import React from "react";
import ReactMarkdown from "react-markdown";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

import "./styles.scss";

export function DataProtectionLaw() {
  const dataProtectionLaw = getLocalizedValue(PublicSettings.dataProtectionLaw);

  if (!dataProtectionLaw) {
    return null;
  }

  return (
    <div className="mb-3 register-data-protection-law text-body-secondary">
      <ReactMarkdown linkTarget="_blank" children={dataProtectionLaw} />
    </div>
  );
}
