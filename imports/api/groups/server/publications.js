import { Meteor } from 'meteor/meteor';

import Groups from '../groups';

Meteor.publish('groupsFind', function (filter) {
	// Filter function on the server doesn't have access to current user ID
	if (filter.own) {
		delete filter.own;
		filter.user = this.userId;
	}
	return Groups.findFilter(filter);
});

Meteor.publish('group', groupId => Groups.find(groupId));
