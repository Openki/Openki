// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
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
		find.members = Meteor.userId();
	}
	if (filter.user) {
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

		var update = {};
		if (join) {
			update = { $addToSet: { 'members': user._id } }
		} else {
			update = { $pull: { 'members': user._id } }
		}
		
		Groups.update(sel, update, checkUpdateOne);
	}
});