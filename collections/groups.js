// ======== DB-Model: ========
// "_id"           -> ID
// "name"          -> String
// "short"         -> String
// "claim"         -> String
// "description"   -> String
// "members"       -> List of userIds
// ===========================

Groups = new Meteor.Collection("Groups");
GroupLib = {};

/* Find groups for given filters
 *
 * filter: dictionary with filter options
 *   own: Limit to groups where logged-in user is a member
 *   user: Limit to groups where given user ID is a member (client only)
 *   tags: Group must have all of the given tags
 *
 */
GroupLib.find = function(filter) {
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

GroupLib.isMember = function(userId, groupId) {
	check(userId, String);
	check(groupId, String);
	return Groups.find({
		_id: groupId,
		members: userId
	}).count() > 0;
};


Meteor.methods({
	saveGroup: function(groupId, changes) {
		check(groupId, String);
		check(changes, {
			short:         Match.Optional(String),
			name:          Match.Optional(String),
			claim:         Match.Optional(String),
			description:   Match.Optional(String),
			logoUrl:       Match.Optional(String),
			backgroundUrl: Match.Optional(String),
		});

		var userId = Meteor.userId();
		if (!userId) throw new Meteor.Error(401, "please log-in");

		var isNew = groupId === 'create';

		// Load group from DB
		var group;
		if (isNew) {
			// Saving user is added as first member of the group
			group = {
				members: [userId]
			};
		} else {
			group = Groups.findOne(groupId);
			if (!group) throw new Meteor.Error(404, "Group not found");
		}

		// User must be member of group to edit it
		if (!isNew && !GroupLib.isMember(Meteor.userId(), group._id)) {
			throw new Meteor.Error(401, "Denied");
		}

		var updates = {};
		if (changes.short !== undefined) {
			var short = changes.short.trim();
			if (short.length === 0) {
				short = ''+(group.name || changes.name);
			}
			updates.short = short.substring(0, 7);
		}
		if (changes.hasOwnProperty('name')) {
			updates.name = changes.name.substring(0, 50);
		}
		if (changes.hasOwnProperty('claim')) {
			updates.claim = changes.claim.substring(0, 1000);
		}
		if (changes.hasOwnProperty('description')) {
			updates.description = changes.description.substring(0, 640*1024);
			if (Meteor.isServer) {
				updates.description = saneHtml(updates.description);
			}
		}

		if (changes.hasOwnProperty('logoUrl')) {
			updates.logoUrl = changes.logoUrl.substring(0, 1000);
		}
		if (changes.hasOwnProperty('backgroundUrl')) {
			updates.backgroundUrl = changes.backgroundUrl.substring(0, 1000);
		}

		// Don't update nothing
		if (Object.getOwnPropertyNames(updates).length === 0) return;

		if (isNew) {
			groupId = Groups.insert(_.extend(group, updates));
			Meteor.call('user.updateBadges', userId);
		} else {
			Groups.update(group._id, { $set: updates });
		}

		return groupId;
	},

	updateGroupMembership: function(userId, groupId, join) {
		check(userId, String);
		check(groupId, String);

		var senderId = Meteor.userId();
		if (!senderId) throw new Meteor.Error("Not permitted");

		// Only current members of the group may draft other people into it
		// We build a selector that only finds the group if the sender is a
		// member of it.
		var sel = {
			_id: groupId,
			members: senderId
		};

		// This check is not strictly necessary when the update uses the same
		// selector. It generates an error message though, whereas the update is
		// blind to that.
		if (!Groups.findOne(sel)) throw new Meteor.Error("No permitted");

		var user = Meteor.users.findOne({_id: userId});
		if (!user) throw new Meteor.Error(404, "User not found");

		var update;
		if (join) {
			update = { $addToSet: { 'members': user._id } };
		} else {
			update = { $pull: { 'members': user._id } };
		}

		// By using the restrictive selector that checks group membership we can
		// avoid the unlikely race condition where a user is not member anymore
		// but can still add somebody else to the group.
		Groups.update(sel, update);

		if (Meteor.isServer) Meteor.call('user.updateBadges', user._id);
	},

	/* Update listing of a course or an event in a group. */
	updateGroupListing: function(thingId, groupId, join) {
		check(thingId, String);
		check(groupId, String);

		var senderId = Meteor.userId();
		if (!senderId) return;

		// Only current members of the group may list courses into groups
		if (!GroupLib.isMember(senderId, groupId)) {
			throw new Meteor.Error(401, "Denied");
		}

		var update;
		if (join) {
			update = { $addToSet: { 'groups': groupId } };
		} else {
			update = { $pull: { 'groups': groupId } };
		}

		// Welcome to my world of platypus-typing
		// Because thing may either be a group or an event, we just try both!
		var changed = Courses.update(thingId, update)
		            + Events.update(thingId, update);

		if (changed !== 1) throw new Meteor.Error(500, "Query affected "+changed+" documents, expected 1");
	}
});