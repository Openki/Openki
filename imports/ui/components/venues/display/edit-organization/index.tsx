import React from "react";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { VenueModel } from "/imports/api/venues/venues";

import { OrganizationTag } from "../../../organizations/tag";
import { Add } from "./Add";
import { Remove } from "./Remove";

export interface Props {
  venue: VenueModel;
}

export function EditOrganization({ venue }: Props) {
  const user = useUser();

  const organizationId = venue.editOrganization;
  return (
    <span className="tag-group multiline">
      {organizationId ? (
        <>
          <OrganizationTag organizationId={organizationId} />
          {venue.editableBy(user) && <Remove venue={venue} organizationId={organizationId} />}
        </>
      ) : (
        <Add venue={venue} />
      )}
    </span>
  );
}
