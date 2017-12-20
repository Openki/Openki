import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import Filtering from '/imports/utils/filtering.js';
import '/imports/Predicates.js';

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
	{ tags: Predicates.ids
	}
);

/* Find groups for given filters
 *
 * filter: dictionary with filter options
 *   own: Limit to groups where logged-in user is a member
 *   user: Limit to groups where given user ID is a member (client only)
 *   tags: Group must have all of the given tags
 *
 */
Groups.findFilter = function(filter) {
	var find = {};

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

	if (filter.tags && filter.tags.length > 0) {
    	find.tags = { $all: filter.tags };
	}

	return Groups.find(find);
};
