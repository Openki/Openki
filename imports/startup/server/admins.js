import { Meteor } from 'meteor/meteor';

import { Users } from '/imports/api/users/users';

Meteor.startup(() => {
	(Meteor.settings.admins || []).forEach((username) => {
		const user = Users.findOne({ username });
		if (user) {
			Users.update({ _id: user._id }, { $addToSet: { privileges: 'admin' } });
		}
	});
});
