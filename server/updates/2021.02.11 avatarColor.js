import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

/** @typedef {import('/imports/api/users/users').UserModel} UserModel */

export default function update() {
	let updated = 0;

	Meteor.users.find({}).fetch().forEach((orginalUser) => {
		/** @type {UserModel} */
		const user = { ...orginalUser };
		user.avatar = {};
		user.avatar.color = _.random(360);

		updated += Meteor.users.update(user._id, user);
	});

	return updated;
}
