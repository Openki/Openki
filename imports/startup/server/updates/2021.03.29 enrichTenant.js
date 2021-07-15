import { Meteor } from 'meteor/meteor';
import { Tenants } from '/imports/api/tenants/tenants';
import { Regions } from '/imports/api/regions/regions';
import { Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Users } from '/imports/api/users/users';

export function update() {
	let updated = 0;

	const tenantId = Tenants.insert({
		name: Meteor.settings.public.siteName,
		members: [],
	});

	updated += 1;

	updated += Regions.update({}, { $set: { tenant: tenantId } }, { multi: true });
	updated += Courses.update({}, { $set: { tenant: tenantId } }, { multi: true });
	updated += Events.update({}, { $set: { tenant: tenantId } }, { multi: true });
	updated += Users.update({}, { $set: { tenants: [] } }, { multi: true });

	return updated;
}

export default update;
