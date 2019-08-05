import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import Filtering from '/imports/utils/filtering';

// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "short"         -> String
// "claim"         -> String
// "description"   -> String
// "members"       -> List of userIds
// ===========================

const Groups = new Mongo.Collection('Groups');

Groups.Filtering = () => Filtering(
	{},
);

/* Find groups for given filters
 *
 * filter: dictionary with filter options
 *   own: Limit to groups where logged-in user is a member
 *   user: Limit to groups where given user ID is a member (client only)
 *
 */
// eslint-disable-next-line func-names
Groups.findFilter = function (filter, limit, skip, sort) {
	const find = {};

	const options = { skip, sort };

	if (limit > 0) {
		options.limit = limit;
	}

	if (filter.own) {
		const me = Meteor.userId();
		if (!me) return []; // I don't exist? How could I be in a group?!

		find.members = me;
	}

	// If the property is set but falsy, we don't return anything
	if (Object.prototype.hasOwnProperty.call(filter, 'user')) {
		if (!filter.user) return [];
		find.members = filter.user;
	}

	return Groups.find(find, options);
};

export default Groups;
