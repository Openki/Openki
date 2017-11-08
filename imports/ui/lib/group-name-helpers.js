function subbedGroup(group) {
	const groupId = '' + group; // it's not a string?! LOL I DUNNO
	miniSubs.subscribe('group', groupId);
	return Groups.findOne(groupId);
};

export default GroupNameHelpers = {
	short() {
		if (!this) return;
		const group = subbedGroup(this);
		if (!group) return "-";
		return group.short;
	},
	name() {
		if (!this) return;
		const group = subbedGroup(this);
		if (!group) return mf('group.missing', "Group does not exist");
		return group.name;
	},
};
