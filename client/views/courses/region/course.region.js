Template.courseRegion.helpers({
	courseRegion: function() {
		var regionId = this.course ? this.course.region : this.region;
		return Regions.findOne({_id: regionId}).name;
	},

	isProposal: function() {
		return this.course ? !this.course.nextEvent : !this.nextEvent;
	}
});
