import React from "react";
import { useUser } from "/imports/utils/react-meteor-data";

import { VenueModel } from "/imports/api/venues/venues";

import { GroupTag } from "/imports/ui/components/groups/tag";
import { Add } from "./add";
import { Remove } from "./remove";

export type Props = { venue: VenueModel };

export function EditGroup({ venue }: Props) {
  const user = useUser();

  const groupId = venue.editGroup;
  return (
    <span className="tag-group multiline">
      {groupId ? (
        <>
          <GroupTag groupId={groupId} />
          {venue.editableBy(user) && <Remove venue={venue} groupId={groupId} />}
        </>
      ) : (
        <Add venue={venue} />
      )}
    </span>
  );
}
