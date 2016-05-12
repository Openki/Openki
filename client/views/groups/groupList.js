var subbedGroup = function(group) {
	var groupId = ''+group; // it's not a string?! LOL I DUNNO
	miniSubs.subscribe('group', groupId);
	return Groups.findOne(groupId);
};

Template.groupName.helpers({
	short: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return "-";
		return group.short;
	},
	name: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return mf('group.missing', "Group does not exist");
		return group.name;
	},
});

Template.groupName.events({
	"click .group": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupName.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
