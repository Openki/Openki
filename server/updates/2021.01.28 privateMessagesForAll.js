import { Meteor } from 'meteor/meteor';

/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

export default function update() {
	let updated = 0;

	Meteor.users.find({ }).fetch().forEach((orginalUser) => {
		/** @type {UserModel} */
		const user = { ...orginalUser };
		user.allowPrivateMessages = true;
		delete user.acceptsMessages;
		updated += Meteor.users.update(user._id, user);
	});

	return updated;
}
