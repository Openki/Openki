Template.regionTag.helpers({
	regionName: function() {
		var regionId = this.region;
		return Regions.findOne({_id: regionId}).name;
	}
});
