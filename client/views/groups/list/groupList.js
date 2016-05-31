Template.groupName.helpers(groupNameHelpers);

Template.groupName.events({
	"click .js-group-label": function(event, template){
		$(".tooltip").removeClass("show");
	}
});

Template.groupNameFull.helpers(groupNameHelpers);

Template.groupNameFull.events({
	"click .js-group-label": function(event, template){
		$(".tooltip").removeClass("show");
	}
});
