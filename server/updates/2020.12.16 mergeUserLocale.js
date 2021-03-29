import { Users } from '/imports/api/users/users';

/**
 * merge the profile locale into the base locale
 */
export default function update() {
	let updated = 0;

	Users.find({}).fetch().forEach((originalUser) => {
		const user = { ...originalUser };
		if (user.profile) {
			user.locale = user.profile.locale;
			delete user.profile.locale;
		}
		user.locale = user.locale || 'en';
		updated += Users.update(user._id, user);
	});

	return updated;
}
