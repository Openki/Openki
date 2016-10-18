Router.map(function () {
	this.route('regionStatistics', {
		path: 'region/:_id',
		template: 'regionStatistics',
		waitOn: function () {
			return [
				Meteor.subscribe('regions'),
			];
		},
		data: function() {
			var region;
			region = Regions.findOne({_id: this.params._id});
			if(region){
				return region;
			}
			region = Regions.findOne({name: this.params._id})
			if(region){
				return region;
			}
			return false;
		},
	});
});
Template.regionStatistics.helpers({
	test: function() {
		var regionSel = Template.instance().data;
		console.log(regionSel);
		return regionSel.name;
	}
});