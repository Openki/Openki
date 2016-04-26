
Template.groupName.helpers(groupNameHelpers);

Template.groupName.events({
	"click .group": function(event, template){
		template.$("[data-toggle='tooltip']").tooltip('hide');
	}
});

Template.groupName.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};
