// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "short"         -> String
// "claim"         -> String
// "description"   -> String
// "createdby"     -> userId
// "time_created"  -> Date
// "time_lastedit" -> Date
// "members"       -> List of userIds
// ===========================

Groups = new Meteor.Collection("Groups");


/* Find groups for given filters
 *
 * filter: dictionary with filter options
 *   own: Limit to groups where logged-in user is a member
 *   user: Limit to groups where given user ID is a member (client only)
 *
 */
groupsFind = function(filter, limit) {
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

	return Groups.find(find);
}

Meteor.methods({
	updateGroupMembership: function(userId, groupId, join) {
		check(userId, String);
		check(groupId, String);

		var senderId = Meteor.userId();
		if (!senderId) return;

		// Only current members of the group may draft other people into it
		var sel = {
			_id: groupId,
			members: senderId
		}

		var user = Meteor.users.findOne({_id: userId});
		if (!user) throw new Meteor.Error(404, "User not found");

		var update;
		if (join) {
			update = { $addToSet: { 'members': user._id } }
		} else {
			update = { $pull: { 'members': user._id } }
		}

		Groups.update(sel, update, checkUpdateOne);
	},

	/* Update listing of a course or an event in a group. */
	updateGroupListing: function(thingId, groupId, join) {
		check(thingId, String);
		check(groupId, String);

		var senderId = Meteor.userId();
		if (!senderId) return;

		// Only current members of the group may list courses into groups
		var group = Groups.findOne({
			_id: groupId,
			members: senderId
		});
		if (!group) throw new Meteor.Error(401, "Not in group");

		var update;
		if (join) {
			update = { $addToSet: { 'groups': group._id } };
		} else {
			update = { $pull: { 'groups': group._id } };
		}

		// Welcome to my world of platypus-typing
		// Because thing may either be a group or an event, we just try both!
		var changed = Courses.update(thingId, update)
		            + Events.update(thingId, update);

		if (changed !== 1) throw new Meteor.Error(500, "Query affected "+changed+" documents, expected 1");
	}
});