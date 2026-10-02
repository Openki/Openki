import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { useTranslation } from "react-i18next";

import { useCurrentRegion } from "/imports/ui/hooks/useCurrentRegion";
import { checkContribution } from "/imports/utils/checkContribution";
import { PublicSettings } from "/imports/utils/PublicSettings";
import { getCachedUser } from "/imports/ui/lib/getUserName";
import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";
import { getSiteName } from "/imports/utils/getSiteName";

export interface Props {
  userId: string;
}

export function Contribution({ userId }: Props) {
  const { t } = useTranslation();
  const { getLocalizedValue } = useLocalizedSetting();
  const currentRegion = useCurrentRegion();
  const cachedUser = useTracker(() => getCachedUser(userId));

  if (!userId) {
    return null;
  }

  const contribution = PublicSettings.contribution;

  if (!contribution) {
    return null;
  }

  if (!cachedUser) {
    return null;
  }

  if (!checkContribution(cachedUser.contribution)) {
    return null;
  }

  return (
    <a
      data-test="contribution"
      href={getLocalizedValue(contribution.link)}
      data-bs-title={t(
        "user.hasContributed",
        "{USER} supported {SITENAME} with a donation. Click the {ICON} for how to contribute.",
        {
          USER: cachedUser.getDisplayName(),
          SITENAME: getSiteName(currentRegion),
          ICON: `<i class='${contribution.icon}'></i>`,
        },
      )}
    >
      <sup>
        <i className={contribution.icon} />
      </sup>
    </a>
  );
}
