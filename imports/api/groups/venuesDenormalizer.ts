import { VenueModel, Venues } from "../venues/venues";
import { Groups, GroupVenueEntity } from "./groups";

// Based on the guide from meteor: https://guide.meteor.com/collections.html#abstracting-denormalizers

export async function afterVenueAddEditGroup(venue: GroupVenueEntity, groupId: string) {
  await Groups.updateAsync(
    { _id: groupId },
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

export async function afterVenueRemoveEditGroup(venueId: string, groupId: string) {
  await Groups.updateAsync({ _id: groupId }, { $pull: { venues: { _id: venueId } } });
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
  await Groups.updateAsync({ _id: venue.editGroup }, { $pull: { venues: { _id: venue._id } } });
}
