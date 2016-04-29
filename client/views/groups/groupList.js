Template.groupName.helpers({
	name: function(getFullName) {
		if (!this) return;
		var groupId = ''+this; // it's not a string?! LOL I DUNNO
		miniSubs.subscribe('group', groupId);
		var group = Groups.findOne(groupId);
		if (!group) return "removed group";
		if (getFullName) return group && group.name;
		return group && group.short;
	},
});

Template.groupName.events({
	"click .js-group-label": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupName.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};

Template.groupNameStatic.helpers({
	name: function() {
		if (!this) return;
		var groupId = ''+this; // it's not a string?! LOL I DUNNO
		miniSubs.subscribe('group', groupId);
		var group = Groups.findOne(groupId);
		if (!group) return "removed group";
		return group && group.name;
	},
});
