import React from "react";
import { useTranslation } from "react-i18next";

import { Contribution } from "/imports/ui/components/Contribution";
import { ProfileLink } from "/imports/ui/components/profile-link";

export interface Props {
  userId: string | undefined;
}

export function DiscussionProfileLink({ userId }: Props) {
  const { t } = useTranslation();

  return userId ? (
    <>
      <span className="fw-bold">
        <ProfileLink userId={userId} />
      </span>
      <Contribution userId={userId} />
    </>
  ) : (
    <span className="fw-bold">{t("comment.profileLink.anonymous", "Anonymous")}</span>
  );
}
