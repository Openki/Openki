import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { Panel } from "../../panel";
import { Full } from "./Full";
import { Thumb } from "./Thumb";

export interface Props {
  group: GroupModel;
  draggable?: boolean | undefined;
}

export function GroupCompact({ group, draggable }: Props) {
  return (
    <Panel
      id={group._id}
      className="rounded-2"
      thumb={<Thumb group={group} />}
      full={<Full group={group} />}
      draggable={draggable}
    />
  );
}
