import React from "react";
import { Router } from "meteor/iron:router";
import { useTracker } from "meteor/react-meteor-data";

import { getUserName } from "/imports/ui/lib/getUserName";

import { Avatar } from "/imports/ui/components/avatar";

import "./styles.scss";

export interface Props { userId: string | undefined }

export function DiscussionProfileIcon({ userId }: Props) {
  const userName = useTracker(() => {
    if (!userId) {
      return "";
    }
    return getUserName(userId);
  });

  return (
    <div className="discussion-thumb">
      {userId ? (
        <a
          href={Router.path("userprofile", { _id: userId, username: encodeURIComponent(userName) })}
        >
          <Avatar className="discussion-profile-icon" userId={userId} />
        </a>
      ) : (
        <Avatar className="discussion-profile-icon" color={0} />
      )}
    </div>
  );
}
