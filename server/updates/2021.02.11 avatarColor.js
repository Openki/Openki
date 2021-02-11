import { Meteor } from 'meteor/meteor';

/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

export default function update() {
	let updated = 0;

	Meteor.users.find({}).fetch().forEach((orginalUser) => {
		/** @type {UserModel} */
		const user = { ...orginalUser };
		user.avatar = {};
		user.avatar.color = Math.floor(Math.random() * (255 - 0 + 1));

		updated += Meteor.users.update(user._id, user);
	});

	return updated;
}
