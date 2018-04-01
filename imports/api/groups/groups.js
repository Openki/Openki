import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import Filtering from '/imports/utils/filtering.js';

// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "short"         -> String
// "claim"         -> String
// "description"   -> String
// "members"       -> List of userIds
// ===========================

export default Groups = new Mongo.Collection("Groups");

Groups.Filtering = () => Filtering(
	{}
);

/* Find groups for given filters
 *
 * filter: dictionary with filter options
 *   own: Limit to groups where logged-in user is a member
 *   user: Limit to groups where given user ID is a member (client only)
 *
 */
Groups.findFilter = function(filter, limit, skip, sort) {
	var find = {};

	const options = { skip, sort };

	if (limit > 0) {
		options.limit = limit;
	}

	if (filter.own) {
		var me = Meteor.userId();
		if (!me) return []; // I don't exist? How could I be in a group?!

		find.members = me;
	}

	// If the property is set but falsy, we don't return anything
	if (filter.hasOwnProperty('user')) {
		if (!filter.user) return [];
		find.members = filter.user;
	}

	return Groups.find(find, options);
};
