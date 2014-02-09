Template.region_sel.helpers({
	regions: function(){
	  return Regions.find();
	},

	region: function(){
		var region = Regions.findOne(Session.get('region'))
		return region ? region.name : 'All regions'
	}
});

Template.region_sel.events({
	'click a.regionselect': function(){
		localStorage.setItem("region", this._id); // to survive page reload
		Session.set('region', this._id)
		return false
	}
})

