Router.map(function () {
	this.route('regionStatistics', {
		path: 'region/:_id',
		template: 'regionStatistics',
		waitOn: function () {
			var instance = this;
			var regionId = instance.params._id;
			return [
				instance.subscribe('regions'),
				instance.subscribe('venuesFind', { region: regionId }),
			];
		},
		data: function() {
			var instance = this;

			var regionId = instance.params._id;
			var region = Regions.findOne({ _id: regionId} );
			// if(typeof region == 'undefined'){
			// 	region = Regions.findOne({name: this.params._id})
			// }
			return {
				'region': region,
				'venues': venuesFind({region: regionId}),
			};
		},
	});
});
Template.regionStatistics.helpers({
	regionName: function() {
		return Template.instance().data.region.name;
	},
	courseCount: function() {
		return Template.instance().data.region.courseCount;
	},
	futureEventCount:function() {
		return Template.instance().data.region.futureEventCount;
	},
	pastEventCount: function() {
		return Template.instance().data.region.pastEventCount;
	},
	proposalCount: function() {
		return Template.instance().data.region.proposalCount;
	},
	venuesCount: function() {
		return Template.instance().data.venues.count();
	},
	groupsCount: function() {
		return Template.instance().data.region.groups.length;
	},
	groups: function() {
		return Template.instance().data.region.groups;
	}
});