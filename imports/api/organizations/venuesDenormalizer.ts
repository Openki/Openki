import { VenueModel, Venues } from "../venues/venues";
import { Organizations, OrganizationVenueRef } from "./organizations";

// Based on the guide from meteor: https://docs.meteor.com/tutorials/collections/collections.html#abstracting-denormalizers

export async function afterVenueAddEditOrganization(
  venue: OrganizationVenueRef,
  organizationId: string,
) {
  await Organizations.updateAsync(
    { _id: organizationId },
    {
      $addToSet: {
        venues: {
          _id: venue._id,
          name: venue.name,
          slug: venue.slug,
        },
      },
    },
  );
}

export async function afterVenueRemoveEditOrganization(venueId: string, organizationId: string) {
  await Organizations.updateAsync({ _id: organizationId }, { $pull: { venues: { _id: venueId } } });
}

export async function afterVenueUpdate(venueId: string) {
  const venue = await Venues.findOneAsync(venueId);
  if (!venue?.editOrganization) {
    return;
  }
  await Organizations.updateAsync(
    { _id: venue.editOrganization },
    {
      $set: {
        "venues.$[x].name": venue.name,
        "venues.$[x].slug": venue.slug,
      },
    },
    {
      arrayFilters: [
        {
          "x._id": venue._id,
        },
      ],
    },
  );
}

export async function beforeVenueRemove(venue: VenueModel) {
  if (!venue.editOrganization) {
    return;
  }
  await Organizations.updateAsync(
    { _id: venue.editOrganization },
    { $pull: { venues: { _id: venue._id } } },
  );
}
