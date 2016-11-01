Router.map(function () {
	this.route('regionStatistics', {
		path: 'region/:_id',
		template: 'regionStatistics',
		waitOn: function () {
			var instance = this;
			return [
				instance.subscribe('regions'),
				// instance.subscribe('currentUser'),
				// instance.subscribe('coursesFind', { userInvolved: Meteor.userId() }),
				// instance.subscribe('groupsFind', { own: true }),
				// instance.subscribe('venuesFind', { editor: Meteor.userId() })
			];
		},
		data: function() {
			var region;
			region = Regions.findOne({_id: this.params._id});
			if(typeof region == 'undefined'){
				region = Regions.findOne({name: this.params._id})
			}
			console.log(region);
			return region;
		},
	});
});
Template.regionStatistics.helpers({
	test: function() {
		var regionSel = Template.instance().data;
		return regionSel.name;
	}
});