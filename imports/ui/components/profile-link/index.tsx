import { Router } from "meteor/iron:router";
import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import * as StringTools from "/imports/utils/string-tools";

import { getUserName } from "/imports/ui/lib/getUserName";

import "./styles.scss";

export function ProfileLink(props: { userId: string }) {
  const userName = useTracker(() => getUserName(props.userId));

  return (
    <a
      className="profilelink"
      href={Router.path("userprofile", {
        _id: props.userId,
        slug: StringTools.slug(userName),
      })}
    >
      {userName}
    </a>
  );
}
