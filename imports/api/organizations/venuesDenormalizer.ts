import { VenueModel, Venues } from "../venues/venues";
import { Organizations, OrganizationVenueEntity } from "./organizations";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function afterVenueAddEditOrganization(
  venue: OrganizationVenueEntity,
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
  if (!venue?.editGroup) {
    return;
  }
  await Groups.updateAsync(
    { _id: venue.editGroup },
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
  if (!venue.editGroup) {
    return;
  }
  await Organizations.updateAsync(
    { _id: venue.editGroup },
    { $pull: { venues: { _id: venue._id } } },
  );
}
