import { Router } from "meteor/iron:router";
import React from "react";
import { useTracker } from "meteor/react-meteor-data";

import { getUserName } from "/imports/ui/lib/getUserName";

import "./styles.scss";

export function ProfileLink(props: { userId: string }) {
  const userName = useTracker(() => getUserName(props.userId));

  return (
    <a
      className="profilelink"
      href={Router.path("userprofile", {
        _id: props.userId,
        username: userName,
      })}
    >
      {userName}
    </a>
  );
}
