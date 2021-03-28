import Venues from '/imports/api/venues/venues';
import { StringTools } from '/imports/utils/string-tools';

export default function update() {
	let updated = 0;

	Venues.find({ slug: { $exists: false } }).fetch().forEach((orginalVenue) => {
		const venue = { ...orginalVenue };
		venue.slug = StringTools.slug(venue.name);
		updated += Venues.update(venue._id, venue);
	});

	return updated;
}
