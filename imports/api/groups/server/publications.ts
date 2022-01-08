import { Meteor } from 'meteor/meteor';

import { Groups } from '/imports/api/groups/groups';

Meteor.publish('Groups.findFilter', (filter) => Groups.findFilter(filter));

Meteor.publish('group', (groupId) => Groups.find(groupId));
