Template.region_sel.helpers({
	regions: function(){
	  return Regions.find();
	}
});

Template.region_sel.helpers({
	region: function(){
		var region = Regions.findOne(Session.get('region'))
		return region ? region.name : 'All regions'
	}
});

Template.region_sel.events({
	'click a.regionselect': function(){
			Session.set('region', this._id)
		return false
	}
})

