import React from "react";
import { useTranslation } from "react-i18next";

import { Contribution } from "/imports/ui/components/contribution";
import { ProfileLink } from "/imports/ui/components/profile-link";

export type Props = { userId: string | undefined };

export function DiscussionProfileLink({ userId }: Props) {
  const { t } = useTranslation();

  return userId ? (
    <>
      <strong>
        <ProfileLink userId={userId} />
      </strong>
      <Contribution userId={userId} />
    </>
  ) : (
    <strong>{t("comment.profileLink.anonymous", "Anonymous")}</strong>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DiscussionProfileLink", () => DiscussionProfileLink);
