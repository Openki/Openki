Template.groupName.helpers({
	name: function() {
		if (!this) return;
		var groupId = ''+this; // it's not a string?! LOL I DUNNO
		miniSubs.subscribe('group', groupId);
		var group = Groups.findOne(groupId);
		return group && group.short;
	}
});
