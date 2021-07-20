import { _ } from 'meteor/underscore';

import { Users } from '/imports/api/users/users';
/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

export default function update() {
	let updated = 0;

	Users.find({})
		.fetch()
		.forEach((orginalUser) => {
			const user = { ...orginalUser };
			user.avatar = {};
			user.avatar.color = _.random(360);

			updated += Users.update(user._id, user);
		});

	return updated;
}
