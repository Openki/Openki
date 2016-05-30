Template.groupName.helpers(groupNameHelpers);

Template.groupName.events({
	"click .js-group-label": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupName.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};

Template.groupNameFull.helpers(groupNameHelpers);

Template.groupNameFull.events({
	"click .js-group-label": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupNameFull.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
