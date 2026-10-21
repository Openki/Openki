import React from "react";

import { Panel } from "../../panel";
import { Full } from "./Full";
import { Thumb } from "./Thumb";

export interface Props {
  organization: string | undefined;
  draggable?: boolean | undefined;
}

export function CompactPropose({ organization, draggable }: Props) {
  return (
    <Panel
      id="propose"
      className="rounded-2 h-100"
      thumb={<Thumb />}
      full={<Full organization={organization} />}
      draggable={draggable}
    />
  );
}
