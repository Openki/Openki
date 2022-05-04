import { Tenants } from '/imports/api/tenants/tenants';

export function update() {
	let updated = 0;

	updated += Tenants.update({}, { $set: { admins: [] } }, { multi: true });

	return updated;
}

export default update;
