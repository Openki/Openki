import { Meteor } from 'meteor/meteor';

import { Users } from '/imports/api/users/users';

import { PrivateSettings } from '/imports/utils/PrivateSettings';

import { runBackgroundTasks } from '/imports/utils/background-tasks';

if (runBackgroundTasks)
	Meteor.startup(() => {
		PrivateSettings.admins.forEach((username) => {
			const user = Users.findOne({ username });
			if (user) {
				Users.update({ _id: user._id }, { $addToSet: { privileges: 'admin' } });
			}
		});
	});
