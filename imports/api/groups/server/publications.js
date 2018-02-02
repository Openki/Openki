import { Meteor } from 'meteor/meteor';

import Groups from '../groups.js';

Meteor.publish('groupsFind', function(filter) {
	// Filter function on the server doesn't have access to current user ID
	if (filter.own) {
		delete filter.own;
		filter.user = this.userId;
	}
	return Groups.findFilter(filter);
});

Meteor.publish('group', function(groupId) {
	return Groups.find(groupId);
});
