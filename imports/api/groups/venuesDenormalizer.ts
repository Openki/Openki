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
