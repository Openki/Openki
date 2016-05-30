
Template.groupName.helpers(groupNameHelpers);

Template.groupName.events({
	"click .js-group-label": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupName.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};

Template.groupNameFull.helpers({
	name: function() {
		if (!this) return;
		var group = subbedGroup(this);
		if (!group) return mf('group.missing', "Group does not exist");
		return group.name;
	},
});

Template.groupNameFull.events({
	"click .js-group-label": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupNameFull.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
