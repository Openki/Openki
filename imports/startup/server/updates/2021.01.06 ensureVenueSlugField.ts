import { Venues } from "/imports/api/venues/venues";
import * as StringTools from "/imports/utils/string-tools";

export async function update() {
  let updated = 0;

  for (const orginalVenue of await Venues.find({ slug: { $exists: false } }).fetchAsync()) {
    const venue = { ...orginalVenue };
    venue.slug = StringTools.slug(venue.name);
    // eslint-disable-next-line no-await-in-loop
    updated += await Venues.updateAsync(venue._id, venue);
  }

  return updated;
}
