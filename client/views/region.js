Template.region_sel.helpers({
	regions: function(){
	  return Regions.find();
	}
});

Template.region_sel.events({
	'click a.regionselect': function(){
			Session.set('region', this._id)
		return false
	}
})

