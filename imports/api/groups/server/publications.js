import { Meteor } from 'meteor/meteor';

import Groups from '../groups';

// eslint-disable-next-line func-names
Meteor.publish('groupsFind', function (filter) {
	// Filter function on the server doesn't have access to current user ID
	if (filter.own) {
		// eslint-disable-next-line no-param-reassign
		delete filter.own;
		// eslint-disable-next-line no-param-reassign
		filter.user = this.userId;
	}
	return Groups.findFilter(filter);
});

Meteor.publish('group', groupId => Groups.find(groupId));
