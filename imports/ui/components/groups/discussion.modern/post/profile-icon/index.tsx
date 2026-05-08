import React from "react";

import { Avatar } from "/imports/ui/components/avatar";

import "./styles.scss";

export interface Props {
  userId: string | undefined;
}

export function DiscussionProfileIcon({ userId }: Props) {
  return userId ? (
    <Avatar className="discussion-profile-icon2" userId={userId} />
  ) : (
    <Avatar className="discussion-profile-icon2" color={0} />
  );
}
