import { Venues } from "/imports/api/venues/venues";

export async function update() {
  let updated = 0;

  for (const orginalVenue of await Venues.find().fetchAsync()) {
    const venue = { ...orginalVenue };
    venue.allowParallelEvents = true;

    updated += await Venues.updateAsync(venue._id, venue);
  }

  return updated;
}
