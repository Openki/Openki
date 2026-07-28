import React, { useState } from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { Panel } from "../../panel";
import { Full } from "./Full";
import { Thumb } from "./Thumb";

export interface Props {
  group: GroupModel;
}

export function GroupCompact({ group }: Props) {
  const [view, setView] = useState("");

  return (
    <Panel
      id={group._id}
      onChange={(view) => {
        setView(view);
      }}
      thumb={<Thumb group={group} />}
      full={<Full group={group} animation={view === "full" ? "show" : "hide"} />}
    />
  );
}
