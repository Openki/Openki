Template.show_groups.helpers({
	'loadgroups': function(groups) {
		if (!groups) return [];                           // IGNORANCE IS STRENGTH
		return Groups.find({_id: {$in: groups}}).fetch();
	}
});
